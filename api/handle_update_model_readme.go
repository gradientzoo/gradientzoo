package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

type UpdateModelReadmeForm struct {
	Readme string `json:"readme"`
}

func HandleUpdateModelReadme(c *Context, w http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()

	modelId := c.Params.ByName("id")

	clog := log.WithFields(log.Fields{
		"user_id":  c.User.Id,
		"model_id": modelId,
	})

	// Parse the JSON POST body
	decoder := json.NewDecoder(req.Body)
	var form UpdateModelReadmeForm
	if err := decoder.Decode(&form); err != nil {
		msg := "Could not decode readme form"
		clog.WithField("err", err).Error(msg)
		c.Render.JSON(w, http.StatusBadRequest, JsonErr(msg))
		return
	}

	// Validation
	if len(form.Readme) == 0 {
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("Readme must not be empty"))
		return
	}

	m, err := c.Api.Model.ById(modelId)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up model by id")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not update model readme, please try again soon"))
		return
	}
	if m == nil || err == sql.ErrNoRows {
		c.Render.JSON(w, http.StatusNotFound,
			JsonErr("No model with that id was found"))
		return
	}
	if m.UserId != c.User.Id {
		c.Render.JSON(w, http.StatusUnauthorized,
			JsonErr("You're only allowed to update the readme for your own models"))
		return
	}

	m.Readme = form.Readme
	if err = c.Api.Model.Save(m); err != nil {
		clog.WithField("err", err).Error("Could not save model")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not update your model, please try again soon"))
		return
	}

	// Hydrate the model object
	if err = c.Api.Model.Hydrate([]*models.Model{m}); err != nil {
		clog.WithField("err", err).Error("Could not hydrate")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not get that model, please try again soon"))
		return
	}

	// Return the new user and auth token objects
	c.Render.JSON(w, http.StatusOK, map[string]*models.Model{"model": m})
}
