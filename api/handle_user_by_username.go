package api

import (
	"database/sql"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

func HandleUserByUsername(c *Context, w http.ResponseWriter, req *http.Request) {
	username := c.Params.ByName("username")

	fields := log.Fields{}
	if c.User != nil {
		fields["user_id"] = c.User.Id
	}
	clog := log.WithFields(fields)

	user, err := c.Api.User.ByUsername(username)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up user by username")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get that user, please try again soon"))
		return
	}

	if err == sql.ErrNoRows || user == nil {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("No user by that username could be found"))
		return
	}

	// Hydrate the user object
	if err = c.Api.User.Hydrate([]*models.User{user}); err != nil {
		clog.WithField("err", err).Error("Could not hydrate")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could get that user, please try again soon"))
		return
	}

	c.Render.JSON(w, http.StatusOK, map[string]*models.User{"user": user})
}
