package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
)

type AuthForm struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func HandleAuth(c *Context, w http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()

	// Parse the JSON POST body
	decoder := json.NewDecoder(req.Body)
	var form AuthForm
	if err := decoder.Decode(&form); err != nil {
		msg := "Could not decode auth form"
		log.WithField("err", err).Error(msg)
		c.Render.JSON(w, http.StatusBadRequest, JsonErr(msg))
		return
	}

	// TODO: Form validation / sanity / pre-auth check

	clog := log.WithFields(log.Fields{
		"email":          form.Email,
		"empty_password": form.Password == "",
	})

	// First let's check if we have a user with this e-mail address
	user, err := c.Api.User.ByEmail(form.Email)
	if err != nil && err != sql.ErrNoRows {
		clog.WithField("err", err).Error("Could not look up user by email")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not log you in, please try again soon"))
		return
	}

	// If we do find a user
	if err != sql.ErrNoRows {
		clog = clog.WithField("user_id", user.Id)
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
			// If the password is incorrect, return an error saying so
			c.Render.JSON(w, http.StatusUnauthorized,
				JsonErr("Your password was incorrect"))
		}
		return
	}

	// If we didn't find a user, let's create one
	user = models.NewUser(form.Email, form.Password)
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

	// Now create a new auth token for this new user
	authToken := models.NewAuthToken(user.Id)
	if err = c.Api.AuthToken.Save(authToken); err != nil {
		clog.WithField("err", err).Error("Could not save user")
		c.Render.JSON(w, http.StatusBadGateway,
			JsonErr("Could not log you in, please try again soon"))
		return
	}

	// Return these new user and auth token objects
	c.Render.JSON(w, http.StatusOK, map[string]interface{}{
		"auth_user":  user,
		"auth_token": authToken,
	})
}
