package api

import (
	"database/sql"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

func HandleFileVersions(c *Context, w http.ResponseWriter, req *http.Request) {
	username := c.Params.ByName("username")
	slug := c.Params.ByName("slug")
	framework := c.Params.ByName("framework")
	filename := c.Params.ByName("filename")

	fields := log.Fields{
		"username":  username,
		"slug":      slug,
		"framework": framework,
		"filename":  filename,
	}
	if c.User != nil {
		fields["auth_user_id"] = c.User.Id
	}
	clog := log.WithFields(fields)

	user, err := c.Api.User.ByUsername(username)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up user by username")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get those files, please try again soon"))
		return
	}

	if err == sql.ErrNoRows || user == nil {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("No user by that username could be found"))
		return
	}

	clog = clog.WithField("user_id", user.Id)

	m, err := c.Api.Model.ByUserIdSlug(user.Id, slug)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up model by username & slug")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get those files, please try again soon"))
		return
	}
	if err == sql.ErrNoRows || m == nil {
		c.Render.JSON(w, http.StatusNotFound, JsonErr("That model was not found"))
		return
	}
	if m.Visibility == "private" && (c.User == nil || m.UserId != c.User.Id) {
		c.Render.JSON(w, http.StatusUnauthorized,
			JsonErr("You don't have permission to access those files"))
		return
	}

	clog = clog.WithField("model_id", m.Id)

	files, err := c.Api.File.ByModelIdFrameworkFilename(m.Id, framework, filename)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up files by model id, " +
			"framework, and file name")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get those files, please try again soon"))
		return
	}

	// Hydrate the file objects
	if err = c.Api.File.Hydrate(files); err != nil {
		clog.WithField("err", err).Error("Could not hydrate file")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get those files, please try again soon"))
		return
	}

	c.Render.JSON(w, http.StatusOK, map[string][]*models.File{"files": files})
}
