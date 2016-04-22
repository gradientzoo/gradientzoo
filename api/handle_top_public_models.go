package api

import (
	"database/sql"
	"net/http"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

func HandleTopPublicModels(c *Context, w http.ResponseWriter, req *http.Request) {
	period := c.Params.ByName("period")

	fields := log.Fields{"period": period}
	if c.User != nil {
		fields["auth_user_id"] = c.User.Id
	}
	clog := log.WithFields(fields)

	var end time.Time = time.Now().UTC()
	var start time.Time
	switch period {
	case "day":
		start = end.AddDate(0, 0, -1)
	case "week":
		start = end.AddDate(0, 0, -7)
	case "month":
		start = end.AddDate(0, 0, -30)
	case "all":
	case "":
		start = end.AddDate(0, 0, -10000)
	default:
		msg := "Invalid time period specified"
		clog.Error(msg)
		c.Render.JSON(w, http.StatusBadRequest, JsonErr(msg))
		return
	}

	ms, err := c.Api.Model.ByDownloads("public", start, end, 10, "")
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

	// Hydrate the user objects
	if err = c.Api.User.Hydrate(users); err != nil {
		clog.WithField("err", err).Error("Could not hydrate users")
	}

	c.Render.JSON(w, http.StatusOK, map[string]interface{}{
		"models": ms,
		"users":  users,
	})
}
