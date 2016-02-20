package blobstorage

import (
	"time"
)

//go:generate counterfeiter $GOFILE BlobStorage
type BlobStorage interface {
	Save(data []byte, filename, contentType string) error
	Delete(filename string) error
	MakeUrl(filename string, expireTime time.Duration) (string, error)
}
