package api

import (
	"database/sql"
	"io/ioutil"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

func HandleFileUpload(c *Context, w http.ResponseWriter, req *http.Request) {
	username := c.Params.ByName("username")
	slug := c.Params.ByName("slug")
	framework := c.Params.ByName("framework")
	filename := c.Params.ByName("filename")
	clientName := req.Header.Get("X-Gradientzoo-Client-Name")

	clog := log.WithFields(log.Fields{
		"user_id":         c.User.Id,
		"file_username":   username,
		"file_model_slug": slug,
		"file_framework":  framework,
		"filename":        filename,
		"client_name":     clientName,
	})

	// First let's look up the user by their username
	user, err := c.Api.User.ByUsername(username)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up user by username")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get that model, please try again soon"))
		return
	}

	if err == sql.ErrNoRows || user == nil {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("No user by that username could be found"))
		return
	}

	clog = clog.WithField("file_user_id", user.Id)

	// Now we get the model
	m, err := c.Api.Model.ByUserIdSlug(user.Id, slug)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up model by username & slug")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not save your file, please try again soon"))
		return
	}
	if err == sql.ErrNoRows || user == nil {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("No model by that username and slug could be found"))
		return
	}
	if m.UserId != c.User.Id {
		c.Render.JSON(w, http.StatusUnauthorized,
			JsonErr("You're only allowed to upload files for your own models"))
		return
	}

	clog = clog.WithField("file_model_id", m.Id)

	// Delete any pending files
	if err = c.Api.File.DeletePending(m.Id, filename); err != nil {
		clog.WithField("err", err).Error("Could not delete pending files")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not save your file, please try again soon"))
		return
	}

	// Now let's create the new file object
	f := models.NewFile(c.User.Id, m.Id, filename, framework, clientName)
	if err = c.Api.File.Save(f); err != nil {
		clog.WithField("err", err).Error("Could not save file to database")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not save your file, please try again soon"))
		return
	}

	// Open the file from the request
	file, _, err := req.FormFile("file")
	if err != nil {
		clog.WithField("err", err).Error("Could not get uploaded file")
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("Could not get uploaded file"))
		return
	}
	defer file.Close()

	// Read the file into memory (S3 requires exact content length) :(
	// TODO: buffer into a file if the upload is large
	data, err := ioutil.ReadAll(file)
	if err != nil {
		clog.WithField("err", err).Error("Could not read uploaded file")
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("Could not read uploaded file"))
		return
	}

	// Save the file to blob storage
	if err = c.Blob.Save(data, f.BlobFilename(), "application/octet-stream"); err != nil {
		clog.WithField("err", err).Error("Could not store the image")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not save your file, please try again soon"))
		return
	}

	// Now we commit this new pending file
	if err = c.Api.File.CommitPending(m.Id, filename, f.Id); err != nil {
		clog.WithField("err", err).Error("Could not commit pending")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not finalize file upload, please try again soon"))
		return
	}

	files, err := c.Api.File.ToDelete(m.Id, filename, 10)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not delete old files")
	}

	for _, f := range files {
		fn := f.BlobFilename()
		if err = c.Blob.Delete(fn); err != nil {
			clog.WithFields(log.Fields{
				"err": err,
				"delete_blob_filename": fn,
			}).Error("Could not delete old file from blob storage")
		}
		if err = c.Api.File.Delete(f.Id); err != nil {
			clog.WithFields(log.Fields{
				"err":            err,
				"delete_file_id": f.Id,
			}).Error("Could not delete old file object")
		}
	}

	// Return the new user and auth token objects
	c.Render.JSON(w, http.StatusOK, map[string]*models.File{"file": f})
}
