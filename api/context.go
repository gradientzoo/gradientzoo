package api

import (
	"github.com/ericflo/gradientzoo/blobstorage"
	"github.com/ericflo/gradientzoo/models"
	"github.com/julienschmidt/httprouter"
	"gopkg.in/unrolled/render.v1"
)

type Context struct {
	Render    *render.Render
	Params    httprouter.Params
	AuthToken *models.AuthToken
	User      *models.User
	Api       *models.ApiCollection
	Blob      blobstorage.BlobStorage
}
