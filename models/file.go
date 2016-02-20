package models

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/pborman/uuid"
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
	ByModelIdLatest(modelId string) ([]*File, error)
	ByModelIdFilenameLatest(modelId, filename string) (*File, error)
	ByModelIdFilename(modelId, filename string) ([]*File, error)
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
	Id          string    `db:"id" json:"id" msgpack:"id"`
	UserId      string    `db:"user_id" json:"user_id" msgpack:"user_id"`
	ModelId     string    `db:"model_id" json:"model_id" msgpack:"model_id"`
	Filename    string    `db:"filename" json:"filename" msgpack:"filename"`
	Status      string    `db:"status" json:"-" msgpack:"-"`
	Kind        string    `db:"kind" json:"kind" msgpack:"kind"`
	ClientName  string    `db:"client_name" json:"client_name" msgpack:"client_name"`
	CreatedTime time.Time `db:"created_time" json:"created_time" msgpack:"created_time"`
}

func NewFile(userId, modelId, filename, kind, clientName string) *File {
	f := &File{
		Id:          uuid.NewUUID().String(),
		UserId:      userId,
		ModelId:     modelId,
		Filename:    filename,
		Status:      "pending",
		Kind:        kind,
		ClientName:  clientName,
		CreatedTime: time.Now().UTC(),
	}
	return f
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
	return files, err
}

func (db *FileDb) Delete(id interface{}) error {
	_, err := db.DB.
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
		"kind",
		"client_name",
		"created_time",
	}
	vals := []interface{}{
		f.Id,
		f.UserId,
		f.ModelId,
		f.Filename,
		f.Status,
		f.Kind,
		f.ClientName,
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
	return nil
}

func (db *FileDb) Truncate() error {
	_, err := db.DB.DeleteFrom(FILE_TABLE).Exec()
	return err
}

// -

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
	return files, err
}

func (db *FileDb) ByModelIdFilenameLatest(modelId, filename string) (*File, error) {
	var file File
	err := db.DB.
		Select("*").
		From(FILE_TABLE).
		Where("model_id = $1 AND filename = $2 AND status = $3", modelId, filename, "latest").
		QueryStruct(&file)
	if err == sql.ErrNoRows {
		return nil, err
	}
	return &file, err
}

func (db *FileDb) ByModelIdFilename(modelId, filename string) ([]*File, error) {
	var files []*File
	err := db.DB.
		Select("*").
		From(FILE_TABLE).
		Where("model_id = $1 AND filename = $2 AND (status = $3 OR status = $4)", modelId, filename, "latest", "old").
		QueryStructs(&files)
	if files == nil {
		files = []*File{}
	}
	return files, err
}

func (db *FileDb) DeletePending(modelId, filename string) error {
	_, err := db.DB.
		DeleteFrom(FILE_TABLE).
		Where("model_id = $1 AND filename = $2 AND status = 'pending'", modelId, filename).
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
	return files, err
}
