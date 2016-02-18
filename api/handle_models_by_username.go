package api

import (
	"database/sql"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

func HandleModelsByUsername(c *Context, w http.ResponseWriter, req *http.Request) {
	username := c.Params.ByName("username")

	fields := log.Fields{"username": username}
	if c.User != nil {
		fields["auth_user_id"] = c.User.Id
	}
	clog := log.WithFields(fields)

	user, err := c.Api.User.ByUsername(username)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up user by username")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get those models, please try again soon"))
		return
	}

	if err == sql.ErrNoRows || user == nil {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("No user by that username could be found"))
		return
	}

	clog = clog.WithField("user_id", user.Id)

	ms, err := c.Api.Model.ByUserId(user.Id)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up models by username")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get those models, please try again soon"))
		return
	}

	c.Render.JSON(w, http.StatusOK, map[string][]*models.Model{"models": ms})
}
