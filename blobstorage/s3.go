package blobstorage

import (
	"bytes"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
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

func (s *S3BlobStorage) makeSvc() *s3.S3 {
	return s3.New(session.New(&aws.Config{Region: &s.region}))
}

func (s *S3BlobStorage) Save(data []byte, filename, contentType string) error {
	svc := s.makeSvc()
	_, err := svc.PutObject(&s3.PutObjectInput{
		ContentLength: aws.Int64(int64(len(data))),
		ContentType:   aws.String(contentType),
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(filename),
		Body:          bytes.NewReader(data),
	})
	return err
}

func (s *S3BlobStorage) Delete(filename string) error {
	svc := s.makeSvc()
	_, err := svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(filename),
	})
	return err
}

func (s *S3BlobStorage) MakeUrl(filename string, expireTime time.Duration) (string, error) {
	svc := s.makeSvc()
	req, _ := svc.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(filename),
	})
	return req.Presign(expireTime)
}
