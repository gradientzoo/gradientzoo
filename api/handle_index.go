package api

import (
	"net/http"

	log "github.com/Sirupsen/logrus"
)

func HandleIndex(c *Context, w http.ResponseWriter, req *http.Request) {
	if err := c.Publisher.Publish("testing", "", "Hello, world"); err != nil {
		log.WithField("err", err).Error("Could not publish message")
	}
	c.Render.JSON(w, http.StatusOK, map[string]string{"hello": "world"})
}
