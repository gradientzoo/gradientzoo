package blobstorage

//go:generate counterfeiter $GOFILE BlobStorage
type BlobStorage interface {
	Save(data []byte, filename, contentType string) error
}
