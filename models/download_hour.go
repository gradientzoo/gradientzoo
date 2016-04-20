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

type DownloadCounts struct {
	Week  int `json:"week"`
	Month int `json:"month"`
	All   int `json:"all"`
}

type FileDownloads struct {
	FileId string `db:"file_id"`
	DownloadCounts
}

type ModelDownloads struct {
	ModelId string `db:"model_id"`
	DownloadCounts
}

//go:generate counterfeiter $GOFILE DownloadHourApi
type DownloadHourApi interface {
	MarkDownload(fileId, userId, ip string, t time.Time) error
	CountByFile(fileId string) (DownloadCounts, error)
	CountsByFiles(fileIds []string) (map[string]DownloadCounts, error)
	CountByModel(modelId string) (DownloadCounts, error)
	CountsByModels(modelIds []string) (map[string]DownloadCounts, error)
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

func (db *DownloadHourDb) CountByFile(fileId string) (DownloadCounts, error) {
	sql := `
  SELECT
    COALESCE(SUM(CASE WHEN DH.hour >= (NOW() - INTERVAL '1 week') THEN DH.downloads ELSE 0 END)) AS week,
    COALESCE(SUM(CASE WHEN DH.hour >= (NOW() - INTERVAL '1 month') THEN DH.downloads ELSE 0 END)) AS month,
    COALESCE(SUM(DH.downloads), 0) AS all
  FROM download_hour DH
  WHERE DH.file_id = $1
  `

	var downloads DownloadCounts
	err := db.DB.SQL(sql, fileId).QueryStruct(&downloads)
	return downloads, err
}

func (db *DownloadHourDb) CountsByFiles(fileIds []string) (map[string]DownloadCounts, error) {
	if len(fileIds) == 0 {
		return map[string]DownloadCounts{}, nil
	}

	sql := `
  SELECT
    DH.file_id AS file_id,
    COALESCE(SUM(CASE WHEN DH.hour >= (NOW() - INTERVAL '1 week') THEN DH.downloads ELSE 0 END)) AS week,
    COALESCE(SUM(CASE WHEN DH.hour >= (NOW() - INTERVAL '1 month') THEN DH.downloads ELSE 0 END)) AS month,
    COALESCE(SUM(DH.downloads), 0) AS all
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
	resp := map[string]DownloadCounts{}
	for _, fileId := range fileIds {
		resp[fileId] = DownloadCounts{}
	}
	for _, fileDownload := range fileDownloads {
		resp[fileDownload.FileId] = DownloadCounts{
			Week:  fileDownload.Week,
			Month: fileDownload.Month,
			All:   fileDownload.All,
		}
	}

	return resp, nil
}

func (db *DownloadHourDb) CountByModel(modelId string) (DownloadCounts, error) {
	sql := `
  SELECT
    COALESCE(SUM(CASE WHEN DH.hour >= (NOW() - INTERVAL '1 week') THEN DH.downloads ELSE 0 END)) AS week,
    COALESCE(SUM(CASE WHEN DH.hour >= (NOW() - INTERVAL '1 month') THEN DH.downloads ELSE 0 END)) AS month,
    COALESCE(SUM(DH.downloads), 0) AS all
  FROM download_hour DH
  LEFT JOIN file F ON (F.id = DH.file_id)
  WHERE F.model_id = $1
  `

	var downloads DownloadCounts
	err := db.DB.SQL(sql, modelId).QueryStruct(&downloads)
	return downloads, err
}

func (db *DownloadHourDb) CountsByModels(modelIds []string) (map[string]DownloadCounts, error) {
	if len(modelIds) == 0 {
		return map[string]DownloadCounts{}, nil
	}

	sql := `
  SELECT
    F.model_id AS model_id,
    COALESCE(SUM(CASE WHEN DH.hour >= (NOW() - INTERVAL '1 week') THEN DH.downloads ELSE 0 END)) AS week,
    COALESCE(SUM(CASE WHEN DH.hour >= (NOW() - INTERVAL '1 month') THEN DH.downloads ELSE 0 END)) AS month,
    COALESCE(SUM(DH.downloads), 0) AS all
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
	resp := map[string]DownloadCounts{}
	for _, modelId := range modelIds {
		resp[modelId] = DownloadCounts{}
	}
	for _, modelDownload := range modelDownloads {
		resp[modelDownload.ModelId] = DownloadCounts{
			Week:  modelDownload.Week,
			Month: modelDownload.Month,
			All:   modelDownload.All,
		}
	}

	return resp, nil
}

func (db *DownloadHourDb) Truncate() error {
	_, err := db.DB.DeleteFrom(DOWNLOAD_HOUR_TABLE).Exec()
	return err
}
