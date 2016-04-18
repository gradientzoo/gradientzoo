package models

import (
	"time"

	runner "gopkg.in/mgutz/dat.v1/sqlx-runner"
)

const DOWNLOAD_HOUR_TABLE = "download_hour"

type DownloadHourDb struct {
	DB  *runner.DB
	Api *ApiCollection
}

type FileDownloads struct {
	FileId    string `db:"file_id"`
	Downloads int    `db:"downloads"`
}

type ModelDownloads struct {
	ModelId   string `db:"model_id"`
	Downloads int    `db:"downloads"`
}

//go:generate counterfeiter $GOFILE DownloadHourApi
type DownloadHourApi interface {
	MarkDownload(fileId, userId, ip string, t time.Time) error
	TotalCountByFile(fileId string) (int, error)
	TotalCountsByFiles(fileIds []string) (map[string]int, error)
	TotalCountByModel(modelId string) (int, error)
	TotalCountsByModels(modelIds []string) (map[string]int, error)
	Truncate() error
}

func NewDownloadHourDb(db *runner.DB, api *ApiCollection) *DownloadHourDb {
	return &DownloadHourDb{
		DB:  db,
		Api: api,
	}
}

func (db *DownloadHourDb) MarkDownload(fileId, userId, ip string, t time.Time) error {
	t = t.Truncate(time.Hour)

	sql := `
  INSERT INTO
    download_hour (file_id, user_id, ip, hour, downloads)
  VALUES ($1, $2, $3, $4, 1)
  ON CONFLICT ON CONSTRAINT download_hour_file_id_hour_ip_key
    DO UPDATE SET downloads = download_hour.downloads + 1
  RETURNING *
  `

	_, err := db.DB.Exec(sql, fileId, userId, ip, t)
	return err
}

func (db *DownloadHourDb) TotalCountByFile(fileId string) (int, error) {
	sql := `
  SELECT COALESCE(SUM(DH.downloads), 0)
  FROM download_hour DH
  WHERE DH.file_id = $1
  `

	var downloads int
	err := db.DB.SQL(sql, fileId).QueryScalar(&downloads)
	return downloads, err
}

func (db *DownloadHourDb) TotalCountsByFiles(fileIds []string) (map[string]int, error) {
	sql := `
  SELECT
    DH.file_id AS file_id,
    COALESCE(SUM(DH.downloads), 0) AS downloads
  FROM download_hour DH
  WHERE DH.file_id IN $1
  GROUP BY DH.file_id
  `
	var fileDownloads []*FileDownloads
	err := db.DB.SQL(sql, fileIds).QueryStructs(&fileDownloads)
	if err != nil {
		return nil, err
	}

	// Now build up the map out of the structs we downloaded
	resp := map[string]int{}
	for _, fileId := range fileIds {
		resp[fileId] = 0
	}
	for _, fileDownload := range fileDownloads {
		resp[fileDownload.FileId] = fileDownload.Downloads
	}

	return resp, nil
}

func (db *DownloadHourDb) TotalCountByModel(modelId string) (int, error) {
	sql := `
  SELECT COALESCE(SUM(DH.downloads), 0)
  FROM download_hour DH
  LEFT JOIN file F ON (F.id = DH.file_id)
  WHERE F.model_id = $1
  `

	var downloads int
	err := db.DB.SQL(sql, modelId).QueryScalar(&downloads)
	return downloads, err
}

func (db *DownloadHourDb) TotalCountsByModels(modelIds []string) (map[string]int, error) {
	sql := `
  SELECT
    F.model_id AS model_id,
    COALESCE(SUM(DH.downloads), 0) AS downloads
  FROM download_hour DH
  LEFT JOIN file F ON (F.id = DH.file_id)
  WHERE F.model_id IN $1
  GROUP BY F.model_id
  `
	var modelDownloads []*ModelDownloads
	err := db.DB.SQL(sql, modelIds).QueryStructs(&modelDownloads)
	if err != nil {
		return nil, err
	}

	// Now build up the map out of the structs we downloaded
	resp := map[string]int{}
	for _, modelId := range modelIds {
		resp[modelId] = 0
	}
	for _, modelDownload := range modelDownloads {
		resp[modelDownload.ModelId] = modelDownload.Downloads
	}

	return resp, nil
}

func (db *DownloadHourDb) Truncate() error {
	_, err := db.DB.DeleteFrom(DOWNLOAD_HOUR_TABLE).Exec()
	return err
}
