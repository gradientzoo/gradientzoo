package api

import (
	"net/http"

	log "github.com/Sirupsen/logrus"
)

func HandleLogout(c *Context, w http.ResponseWriter, req *http.Request) {
	if err := c.Api.AuthToken.Delete(c.AuthToken.Id); err != nil {
		log.WithFields(log.Fields{
			"err":           err,
			"auth_token_id": c.AuthToken.Id,
			"user_id":       c.User.Id,
		}).Error("Could not delete auth token")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not log you out, please try again soon"))
		return
	}
	c.Render.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
