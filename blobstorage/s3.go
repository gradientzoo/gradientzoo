package blobstorage

import (
	"bytes"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
)

type S3BlobStorage struct {
	bucket string
	region string
}

func NewS3BlobStorage(bucket, region string) *S3BlobStorage {
	return &S3BlobStorage{
		bucket: bucket,
		region: region,
	}
}

func (s *S3BlobStorage) Save(data []byte, filename, contentType string) error {
	svc := s3.New(&aws.Config{Region: s.region})
	_, err := svc.PutObject(&s3.PutObjectInput{
		ContentLength: aws.Long(int64(len(data))),
		ContentType:   aws.String(contentType),
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(filename),
		Body:          bytes.NewReader(data),
	})
	return err
}
