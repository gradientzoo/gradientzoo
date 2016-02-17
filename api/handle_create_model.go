package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

type CreateModelForm struct {
	Slug        string `json:"slug"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Visbility   string `json:"visibility"`
}

func HandleCreateModel(c *Context, w http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()

	clog := log.WithFields(log.Fields{
		"user_id": c.User.Id,
	})

	// Parse the JSON POST body
	decoder := json.NewDecoder(req.Body)
	var form CreateModelForm
	if err := decoder.Decode(&form); err != nil {
		msg := "Could not decode model form"
		clog.WithField("err", err).Error(msg)
		c.Render.JSON(w, http.StatusBadRequest, JsonErr(msg))
		return
	}

	clog = clog.WithFields(log.Fields{
		"slug":       form.Slug,
		"name":       form.Name,
		"visibility": form.Visbility,
	})

	// Validation

	if len(form.Slug) < 3 {
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("Slug must be at least 3 characters long"))
		return
	}

	model, err := c.Api.Model.ByUserIdSlug(c.User.Id, form.Slug)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up model by user and slug")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not sign you up, please try again soon"))
		return
	}
	if err == nil && model != nil {
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("You already have a model with that slug"))
		return
	}

	if len(form.Name) < 3 {
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("Name must be at least 3 characters long"))
		return
	}

	if len(form.Description) > 200 {
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("Short description may be 200 characters maximum"))
		return
	}

	if form.Visbility != "public" && form.Visbility != "private" {
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("Visibility must be one of 'public', 'private'"))
		return
	}

	clog = clog.WithField("passed_validation", true)

	// Let's create a new user
	model = models.NewModel(c.User.Id, form.Slug, form.Name, form.Description,
		form.Visbility)
	if err = c.Api.Model.Save(model); err != nil {
		clog.WithField("err", err).Error("Could not save model")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not create your model, please try again soon"))
		return
	}

	clog = clog.WithField("model_id", model.Id)

	// Return the new user and auth token objects
	c.Render.JSON(w, http.StatusOK, map[string]*models.Model{"model": model})
}
