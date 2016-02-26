package api

import (
	"database/sql"
	"net/http"

	log "github.com/Sirupsen/logrus"
)

func HandleDeleteModel(c *Context, w http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()

	modelId := c.Params.ByName("id")

	clog := log.WithFields(log.Fields{
		"user_id":  c.User.Id,
		"model_id": modelId,
	})

	m, err := c.Api.Model.ById(modelId)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up model by id")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not delete that model, please try again soon"))
		return
	}
	if m == nil || err == sql.ErrNoRows {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("No model with that id was found"))
		return
	}
	if m.UserId != c.User.Id {
		c.Render.JSON(w, http.StatusUnauthorized,
			JsonErr("You're only allowed to delete your own models"))
		return
	}

	// Grab all the files related to this model
	files, err := c.Api.File.ByModelId(m.Id)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not delete old files")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not delete that model, please try again soon"))
		return
	}

	for _, f := range files {
		// Delete the data blob
		fn := f.BlobFilename()
		if err = c.Blob.Delete(fn); err != nil {
			clog.WithFields(log.Fields{
				"err": err,
				"delete_blob_filename": fn,
			}).Error("Could not delete old file from blob storage")
			c.Render.JSON(w, http.StatusBadGateway,
				JsonErr("Could not delete that model, please try again soon"))
			return
		}

		// Then delete the database row
		if err = c.Api.File.Delete(f.Id); err != nil {
			clog.WithFields(log.Fields{
				"err":            err,
				"delete_file_id": f.Id,
			}).Error("Could not delete old file object")
			c.Render.JSON(w, http.StatusBadGateway,
				JsonErr("Could not delete that model, please try again soon"))
			return
		}
	}

	// Delete the model itself
	if err = c.Api.Model.Delete(m.Id); err != nil {
		clog.WithField("err", err).Error("Could not save model")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not delete your model, please try again soon"))
		return
	}

	// Return success
	c.Render.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
