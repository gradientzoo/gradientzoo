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
	TotalCountByFile(fileId string) (int, error)
	TotalCountByModel(modelId string) (int, error)
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

func (db *DownloadHourDb) Truncate() error {
	_, err := db.DB.DeleteFrom(DOWNLOAD_HOUR_TABLE).Exec()
	return err
}
