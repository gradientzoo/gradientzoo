package api

import (
	"net/http"

	//log "github.com/Sirupsen/logrus"
)

func HandleAuthUser(c *Context, w http.ResponseWriter, req *http.Request) {
	c.Render.JSON(w, http.StatusOK, map[string]interface{}{
		"auth_user": c.User,
	})
}
