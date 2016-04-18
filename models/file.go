package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/pborman/uuid"
	null "gopkg.in/guregu/null.v3"
	runner "gopkg.in/mgutz/dat.v1/sqlx-runner"
)

const FILE_TABLE = "file"

type FileDb struct {
	DB  *runner.DB
	Api *ApiCollection
}

//go:generate counterfeiter $GOFILE FileApi
type FileApi interface {
	ById(id interface{}) (*File, error)
	ByIds(ids []interface{}) ([]*File, error)
	Delete(id interface{}) error
	Save(*File) error
	Hydrate([]*File) error
	Truncate() error

	// TODO: Potentially this should be a separate interface
	ByModelIdFilenameLatest(modelId, filename string) (*File, error)
	ByModelIdFrameworkFilename(modelId, framework, filename string) ([]*File, error)
	ByModelIdLatest(modelId string) ([]*File, error)
	ByModelId(modelId string) ([]*File, error)
	DeletePending(modelId, filename string) error
	CommitPending(modelId, filename, fileId string) error
	ToDelete(modelId, filename string, n int) ([]*File, error)
}

func NewFileDb(db *runner.DB, api *ApiCollection) *FileDb {
	return &FileDb{
		DB:  db,
		Api: api,
	}
}

type File struct {
	Id               string                 `db:"id" json:"id"`
	UserId           string                 `db:"user_id" json:"user_id"`
	ModelId          string                 `db:"model_id" json:"model_id"`
	Filename         string                 `db:"filename" json:"filename"`
	Status           string                 `db:"status" json:"status"`
	Framework        string                 `db:"framework" json:"framework"`
	FrameworkVersion string                 `db:"framework_version" json:"framework_version"`
	ClientName       string                 `db:"client_name" json:"client_name"`
	SizeBytes        int                    `db:"size_bytes" json:"size_bytes"`
	MetadataString   string                 `db:"metadata" json:"-"`
	Metadata         map[string]interface{} `db:"-" json:"metadata"`
	CreatedTime      time.Time              `db:"created_time" json:"created_time"`

	// Hydrated fields
	Downloads null.Int `db:"-" json:"downloads"`
}

func NewFile(userId, modelId, filename, framework, frameworkVersion,
	clientName string, sizeBytes int, metadata map[string]interface{}) (*File, error) {
	encodedMetadata, err := json.Marshal(metadata)
	if err != nil {
		return nil, err
	}
	f := &File{
		Id:               uuid.NewUUID().String(),
		UserId:           userId,
		ModelId:          modelId,
		Filename:         filename,
		Status:           "pending",
		Framework:        framework,
		FrameworkVersion: frameworkVersion,
		ClientName:       clientName,
		SizeBytes:        sizeBytes,
		Metadata:         metadata,
		MetadataString:   string(encodedMetadata),
		CreatedTime:      time.Now().UTC(),
	}
	return f, nil
}

func (f *File) FillMetadata() error {
	if f.MetadataString == "" {
		f.Metadata = map[string]interface{}{}
		return nil
	}
	if err := json.Unmarshal([]byte(f.MetadataString), &f.Metadata); err != nil {
		return err
	}
	return nil
}

func (f *File) BlobFilename() string {
	return fmt.Sprintf("files/%s/%s/%s__%d__%s",
		f.UserId,
		f.ModelId,
		f.Id,
		f.CreatedTime.Unix(),
		f.Filename,
	)
}

func (db *FileDb) ById(id interface{}) (*File, error) {
	var f File
	err := db.DB.
		Select("*").
		From(FILE_TABLE).
		Where("id = $1", id).
		QueryStruct(&f)
	if err == sql.ErrNoRows {
		return nil, err
	}
	if err = f.FillMetadata(); err != nil {
		return nil, err
	}
	return &f, err
}

func (db *FileDb) ByIds(ids []interface{}) ([]*File, error) {
	var files []*File
	err := db.DB.
		Select("*").
		From(FILE_TABLE).
		Where("id IN $1", IdStrings(ids)).
		QueryStructs(&files)
	if files == nil {
		files = []*File{}
	}
	for _, f := range files {
		if err = f.FillMetadata(); err != nil {
			return nil, err
		}
	}
	return files, err
}

func (db *FileDb) Delete(id interface{}) error {
	err := db.Api.DownloadHour.DeleteByFileId(id)
	if err != nil {
		return err
	}

	_, err = db.DB.
		DeleteFrom(FILE_TABLE).
		Where("id = $1", id).
		Exec()
	return err
}

func (db *FileDb) Save(f *File) error {
	cols := []string{
		"id",
		"user_id",
		"model_id",
		"filename",
		"status",
		"framework",
		"framework_version",
		"client_name",
		"size_bytes",
		"metadata",
		"created_time",
	}
	vals := []interface{}{
		f.Id,
		f.UserId,
		f.ModelId,
		f.Filename,
		f.Status,
		f.Framework,
		f.FrameworkVersion,
		f.ClientName,
		f.SizeBytes,
		f.MetadataString,
		f.CreatedTime,
	}
	_, err := db.DB.
		Upsert(FILE_TABLE).
		Columns(cols...).
		Values(vals...).
		Where("id = $1", f.Id).
		Exec()
	return err
}

func (db *FileDb) Hydrate(files []*File) error {
	var downloads int
	var err error
	for _, file := range files {
		downloads, err = db.Api.DownloadHour.TotalCountByFile(file.Id)
		if err != nil {
			return err
		}
		file.Downloads = null.IntFrom(int64(downloads))
	}
	return nil
}

func (db *FileDb) Truncate() error {
	_, err := db.DB.DeleteFrom(FILE_TABLE).Exec()
	return err
}

// -

func (db *FileDb) ByModelIdFilenameLatest(modelId, filename string) (*File, error) {
	var f File
	err := db.DB.
		Select("*").
		From(FILE_TABLE).
		Where("model_id = $1 AND filename = $2 AND status = $3",
			modelId, filename, "latest").
		QueryStruct(&f)
	if err == sql.ErrNoRows {
		return nil, err
	}
	if err = f.FillMetadata(); err != nil {
		return nil, err
	}
	return &f, err
}

func (db *FileDb) ByModelIdFrameworkFilename(modelId, framework, filename string) ([]*File, error) {
	var files []*File
	err := db.DB.
		Select("*").
		From(FILE_TABLE).
		Where("model_id = $1 AND "+
			"framework = $2 AND "+
			"filename = $3 AND "+
			"(status = $4 OR status = $5)",
			modelId, framework, filename, "latest", "old").
		QueryStructs(&files)
	if files == nil {
		files = []*File{}
	}
	for _, f := range files {
		if err = f.FillMetadata(); err != nil {
			return nil, err
		}
	}
	return files, err
}

func (db *FileDb) ByModelIdLatest(modelId string) ([]*File, error) {
	var files []*File
	err := db.DB.
		Select("*").
		From(FILE_TABLE).
		Where("model_id = $1 AND status = $2", modelId, "latest").
		QueryStructs(&files)
	if files == nil {
		files = []*File{}
	}
	for _, f := range files {
		if err = f.FillMetadata(); err != nil {
			return nil, err
		}
	}
	return files, err
}

func (db *FileDb) ByModelId(modelId string) ([]*File, error) {
	var files []*File
	err := db.DB.
		Select("*").
		From(FILE_TABLE).
		Where("model_id = $1", modelId).
		QueryStructs(&files)
	if files == nil {
		files = []*File{}
	}
	for _, f := range files {
		if err = f.FillMetadata(); err != nil {
			return nil, err
		}
	}
	return files, err
}

func (db *FileDb) DeletePending(modelId, filename string) error {
	var ids []interface{}

	err := db.DB.
		Select("id").
		From(FILE_TABLE).
		Where("model_id = $1 AND filename = $2 AND status = 'pending'", modelId, filename).
		QuerySlice(&ids)
	if err != nil {
		return err
	}

	_, err = db.DB.
		DeleteFrom(DOWNLOAD_HOUR_TABLE).
		Where("file_id IN $1", ids).
		Exec()

	_, err = db.DB.
		DeleteFrom(FILE_TABLE).
		Where("id IN $1", ids).
		Exec()
	return err
}

func (db *FileDb) CommitPending(modelId, filename, fileId string) error {
	_, err := db.DB.Exec(`
		UPDATE file
    SET status = (CASE WHEN id = $1 THEN 'latest' ELSE 'old' END)
    WHERE model_id = $2 AND
          filename = $3`, fileId, modelId, filename)
	return err
}

func (db *FileDb) ToDelete(modelId, filename string, n int) ([]*File, error) {
	var files []*File
	err := db.DB.
		Select("*").
		From(FILE_TABLE).
		Where("model_id = $1 AND filename = $2", modelId, filename).
		OrderBy("created_time DESC").
		Limit(10000).
		Offset(uint64(n)).
		QueryStructs(&files)
	if files == nil {
		files = []*File{}
	}
	for _, f := range files {
		if err = f.FillMetadata(); err != nil {
			return nil, err
		}
	}
	return files, err
}
