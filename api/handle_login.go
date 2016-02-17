package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

type LoginForm struct {
	EmailOrUsername string `json:"email_or_username"`
	Password        string `json:"password"`
}

func HandleLogin(c *Context, w http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()

	// Parse the JSON POST body
	decoder := json.NewDecoder(req.Body)
	var form LoginForm
	if err := decoder.Decode(&form); err != nil {
		msg := "Could not decode login form"
		log.WithField("err", err).Error(msg)
		c.Render.JSON(w, http.StatusBadRequest, JsonErr(msg))
		return
	}

	// TODO: Form validation / sanity / pre-auth check

	clog := log.WithFields(log.Fields{
		"email_or_username": form.EmailOrUsername,
		"empty_password":    form.Password == "",
	})

	// First let's check if we have a user with this e-mail address
	user, err := c.Api.User.ByEmail(form.EmailOrUsername)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up user by email")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not log you in, please try again soon"))
		return
	}

	// If we can't find the user by e-mail, check by username
	if err == sql.ErrNoRows {
		user, err = c.Api.User.ByUsername(form.EmailOrUsername)
		if err != nil && err != sql.ErrNoRows {
			clog.WithField("err", err).Error("Could not look up user by username")
			c.Render.JSON(w, http.StatusBadGateway,
				JsonErr("Could not log you in, please try again soon"))
			return
		}
	}

	if err == sql.ErrNoRows {
		c.Render.JSON(w, http.StatusUnauthorized,
			JsonErr("No user by that e-mail or username was found"))
		return
	}

	// Check their password
	if user.CheckPassword(form.Password) == nil {
		// If it's correct, create a new auth token for this user
		authToken := models.NewAuthToken(user.Id)
		if err = c.Api.AuthToken.Save(authToken); err != nil {
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
		// Return the user object and the new auth token
		c.Render.JSON(w, http.StatusOK, map[string]interface{}{
			"auth_user":  user,
			"auth_token": authToken,
		})
	} else {
		// If the password is incorrect, return a message saying so
		// (Yes, I know it's safer to be vague about this error, but it's so much
		//  better as a user to get a helpful message that I'm willing to make this
		//  tradeoff until convinced otherwise.)
		c.Render.JSON(w, http.StatusUnauthorized,
			JsonErr("Password didn't match, please re-type it or try another one"))
	}
}
