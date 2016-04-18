package api

import (
	"database/sql"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

func HandleLatestPublicModels(c *Context, w http.ResponseWriter, req *http.Request) {
	fields := log.Fields{}
	if c.User != nil {
		fields["auth_user_id"] = c.User.Id
	}
	clog := log.WithFields(fields)

	ms, err := c.Api.Model.ByVisibility("public", 10, "")
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up latest public models")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get those models, please try again soon"))
		return
	}

	// Hydrate the model objects
	if err = c.Api.Model.Hydrate(ms); err != nil {
		clog.WithField("err", err).Error("Could not hydrate")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get those models, please try again soon"))
		return
	}

	// Build up a unique list of user ids in the keys of a map
	userIdKeys := map[string]bool{}
	for _, m := range ms {
		userIdKeys[m.UserId] = true
	}

	// Now extract those user id keys into a slice
	userIds := make([]interface{}, 0, len(userIdKeys))
	for userId := range userIdKeys {
		userIds = append(userIds, userId)
	}

	// Get a list of users based on those ids
	users, err := c.Api.User.ByIds(userIds)
	if err != nil && err != sql.ErrNoRows {
		clog.WithFields(log.Fields{
			"err":     err,
			"userIds": userIds,
		}).Error("Could not get users by id")
		users = []*models.User{}
	}

	c.Render.JSON(w, http.StatusOK, map[string]interface{}{
		"models": ms,
		"users":  users,
	})
}
