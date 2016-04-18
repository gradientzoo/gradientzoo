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

//go:generate counterfeiter $GOFILE DownloadHourApi
type DownloadHourApi interface {
	MarkDownload(fileId, userId, ip string, t time.Time) error
	CountByFile(fileId string, start, end time.Time) (int, error)
	TotalCountByFile(fileId string) (int, error)
	CountByModel(modelId string, start, end time.Time) (int, error)
	TotalCountByModel(modelId string) (int, error)
	DeleteByFileId(fileId interface{}) error
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
  ON CONFLICT DO UPDATE SET downloads = downloads + 1
  `

	_, err := db.DB.Exec(sql, fileId, userId, ip, t)
	return err
}

func (db *DownloadHourDb) CountByFile(fileId string, start, end time.Time) (int, error) {
	start = start.Truncate(time.Hour)
	end = end.Truncate(time.Hour)

	sql := `
  SELECT COALESCE(SUM(DH.downloads), 0)
  FROM download_hour DH
  WHERE DH.file_id = $1 AND
        DH.hour >= $2 AND
        DH.hour < $3
  `

	var downloads int
	err := db.DB.SQL(sql, fileId, start, end).QueryScalar(&downloads)
	return downloads, err
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

func (db *DownloadHourDb) CountByModel(modelId string, start, end time.Time) (int, error) {
	start = start.Truncate(time.Hour)
	end = end.Truncate(time.Hour)

	sql := `
  SELECT COALESCE(SUM(DH.downloads), 0)
  FROM download_hour DH
  LEFT JOIN file F ON (F.id = DH.file_id)
  WHERE F.model_id = $1 AND
        DH.hour >= $2 AND
        DH.hour < $3
  `

	var downloads int
	err := db.DB.SQL(sql, modelId, start, end).QueryScalar(&downloads)
	return downloads, err
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

func (db *DownloadHourDb) DeleteByFileId(fileId interface{}) error {
	_, err := db.DB.
		DeleteFrom(DOWNLOAD_HOUR_TABLE).
		Where("file_id = $1", fileId).
		Exec()
	return err
}

func (db *DownloadHourDb) Truncate() error {
	_, err := db.DB.DeleteFrom(DOWNLOAD_HOUR_TABLE).Exec()
	return err
}
