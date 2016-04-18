package api

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

func HandleFileById(c *Context, w http.ResponseWriter, req *http.Request) {
	id := c.Params.ByName("id")

	fields := log.Fields{"file_id": id}
	if c.User != nil {
		fields["auth_user_id"] = c.User.Id
	}
	clog := log.WithFields(fields)

	// Get the remote IP
	var ip string
	ips := strings.Split(req.Header.Get("X-Forwarded-For"), ", ")
	if len(ips) > 0 {
		ip = ips[0]
	} else {
		clog.Warn("X-Forwarded-For header not found, falling back to remote addr")
		ip = req.RemoteAddr
	}

	// Get the file by its id
	f, err := c.Api.File.ById(id)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up file")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get your file, please try again soon"))
		return
	}
	if err == sql.ErrNoRows || f == nil {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("There is no file with that id"))
		return
	}

	clog = log.WithFields(log.Fields{
		"file_framework": f.Framework,
		"filename":       f.Filename,
	})

	// Now get the file's user
	user, err := c.Api.User.ById(f.UserId)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up user by username")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get your file, please try again soon"))
		return
	}

	if err == sql.ErrNoRows || user == nil {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("No user by that username could be found"))
		return
	}

	clog = clog.WithFields(log.Fields{
		"file_user_id":  user.Id,
		"file_username": user.Username,
	})

	// Now we get the model
	m, err := c.Api.Model.ById(f.ModelId)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up model by username & slug")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get your file, please try again soon"))
		return
	}
	if err == sql.ErrNoRows || user == nil {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("No model by that username and slug could be found"))
		return
	}
	if m.Visibility == "private" && (c.User == nil || m.UserId != c.User.Id) {
		c.Render.JSON(w, http.StatusUnauthorized,
			JsonErr("You don't have permission to access this file"))
		return
	}

	clog = clog.WithFields(log.Fields{
		"file_model_slug": m.Slug,
		"file_model_id":   m.Id,
	})

	u, err := c.Blob.MakeUrl(f.BlobFilename(), 120*time.Second)
	if err != nil {
		clog.WithField("err", err).Error("Could not make file url")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get your file, please try again soon"))
		return
	}

	err = c.Api.DownloadHour.MarkDownload(f.Id, user.Id, ip, time.Now().UTC())
	if err != nil {
		clog.WithField("err", err).Error("Could not mark download")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get your file, please try again soon"))
		return
	}

	// Hydrate the file object
	if err = c.Api.File.Hydrate([]*models.File{f}); err != nil {
		clog.WithField("err", err).Error("Could not hydrate")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get your file, please try again soon"))
		return
	}

	c.Render.JSON(w, http.StatusOK, map[string]interface{}{
		"url":  u,
		"file": f,
	})
}
