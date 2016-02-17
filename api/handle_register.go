package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

type RegisterForm struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func HandleRegister(c *Context, w http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()

	// Parse the JSON POST body
	decoder := json.NewDecoder(req.Body)
	var form RegisterForm
	if err := decoder.Decode(&form); err != nil {
		msg := "Could not decode auth form"
		log.WithField("err", err).Error(msg)
		c.Render.JSON(w, http.StatusBadRequest, JsonErr(msg))
		return
	}

	// TODO: Moar form validation / sanity / pre-auth check
	if len(form.Email) < 4 || !strings.Contains(form.Email, "@") {
		c.Render.JSON(w, http.StatusBadRequest, JsonErr("Invalid e-mail address"))
		return
	}
	if len(form.Username) < 3 {
		c.Render.JSON(w, http.StatusBadRequest, JsonErr("Username must be at least 3 characters long"))
		return
	}
	if len(form.Password) < 5 {
		c.Render.JSON(w, http.StatusBadRequest, JsonErr("Password must be at least 5 characters long"))
		return
	}

	clog := log.WithFields(log.Fields{
		"email":          form.Email,
		"username":       form.Username,
		"empty_password": form.Password == "",
	})

	// First let's check if we have a user with this e-mail address
	user, err := c.Api.User.ByEmail(form.Email)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up user by email")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not sign you up, please try again soon"))
		return
	}
	if err == nil && user != nil {
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("A user with that e-mail address already exists"))
		return
	}

	// Now check by username
	user, err = c.Api.User.ByUsername(form.Username)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up user by username")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not sign you up, please try again soon"))
		return
	}
	if err == nil && user != nil {
		c.Render.JSON(w, http.StatusBadRequest,
			JsonErr("A user with that username already exists"))
		return
	}

	// Let's create a new user
	user = models.NewUser(form.Email, form.Username, form.Password)
	if err = c.Api.User.Save(user); err != nil {
		clog.WithField("err", err).Error("Could not save user")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not log you in, please try again soon"))
		return
	}

	// Hydrate the user object
	if err = c.Api.User.Hydrate([]*models.User{user}); err != nil {
		clog.WithField("err", err).Error("Could not hydrate")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not log you in, please try again soon"))
		return
	}

	clog = clog.WithField("user_id", user.Id)

	// Now create a new auth token for the new user
	authToken := models.NewAuthToken(user.Id)
	if err = c.Api.AuthToken.Save(authToken); err != nil {
		clog.WithField("err", err).Error("Could not save user")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not log you in, please try again soon"))
		return
	}

	// Return the new user and auth token objects
	c.Render.JSON(w, http.StatusOK, map[string]interface{}{
		"auth_user":  user,
		"auth_token": authToken,
	})
}
