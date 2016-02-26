package api

import (
	"database/sql"
	"net/http"
	"time"

	log "github.com/Sirupsen/logrus"
)

func HandleFile(c *Context, w http.ResponseWriter, req *http.Request) {
	username := c.Params.ByName("username")
	slug := c.Params.ByName("slug")
	kind := c.Params.ByName("kind")
	filename := c.Params.ByName("filename")

	fields := log.Fields{
		"file_username":   username,
		"file_model_slug": slug,
		"file_kind":       kind,
		"filename":        filename,
	}
	if c.User != nil {
		fields["auth_user_id"] = c.User.Id
	}
	clog := log.WithFields(fields)

	// First let's look up the user by their username
	user, err := c.Api.User.ByUsername(username)
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

	clog = clog.WithField("file_user_id", user.Id)

	// Now we get the model
	m, err := c.Api.Model.ByUserIdSlug(user.Id, slug)
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

	clog = clog.WithField("file_model_id", m.Id)

	// Get the latest file
	f, err := c.Api.File.ByModelIdFilenameLatest(m.Id, filename)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up file")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get your file, please try again soon"))
		return
	}
	if err == sql.ErrNoRows || f == nil {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("There is no file by that name"))
		return
	}

	clog = clog.WithField("file_id", f.Id)

	u, err := c.Blob.MakeUrl(f.BlobFilename(), 120*time.Second)
	if err != nil {
		clog.WithField("err", err).Error("Could not make file url")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get your file, please try again soon"))
		return
	}

	c.Render.JSON(w, http.StatusOK, map[string]string{"url": u})
}
