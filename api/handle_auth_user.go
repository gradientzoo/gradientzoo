package api

import (
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

func HandleAuthUser(c *Context, w http.ResponseWriter, req *http.Request) {
	user := c.User

	if user != nil {
		// Hydrate the user object
		if err := c.Api.User.Hydrate([]*models.User{user}); err != nil {
			log.WithFields(log.Fields{
				"err":     err,
				"user_id": user.Id,
			}).Error("Could not hydrate")
			return
		}
	}

	c.Render.JSON(w, http.StatusOK, map[string]interface{}{
		"auth_user": user,
	})
}
