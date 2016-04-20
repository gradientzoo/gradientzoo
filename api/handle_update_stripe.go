package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/ericflo/gradientzoo/models"
	"github.com/ericflo/gradientzoo/utils"
	stripe "github.com/stripe/stripe-go"
	customer "github.com/stripe/stripe-go/customer"
)

type PaymentForm struct {
	StripeToken string `json:"stripe_token"`
}

func HandleUpdateStripe(c *Context, w http.ResponseWriter, req *http.Request) {
	// Parse the JSON POST body
	decoder := json.NewDecoder(req.Body)
	var form PaymentForm
	if err := decoder.Decode(&form); err != nil {
		msg := "Could not decode payment form"
		log.WithField("err", err).Error(msg)
		c.Render.JSON(w, http.StatusBadRequest, JsonErr(msg))
		return
	}
	defer req.Body.Close()

	clog := log.WithFields(log.Fields{
		"user_id":      c.User.Id,
		"stripe_token": form.StripeToken,
	})

	if utils.Conf.Production {
		stripe.Key = utils.Conf.StripeSecretLive
	} else {
		stripe.Key = utils.Conf.StripeSecretTest
	}

	// If the user already has a stripe customer id, something's wrong
	if c.User.StripeCustomerId != "" {
		c.Render.JSON(w, http.StatusBadRequest, JsonErr("Tried to send "+
			"conflicting payment information"))
		return
	}

	// Associate the customer with their e-mail address using their token
	customerParams := &stripe.CustomerParams{
		Desc:   fmt.Sprintf("Customer for %s", c.User.Email),
		Email:  c.User.Email,
		Source: &stripe.SourceParams{Token: form.StripeToken},
	}
	// Associate the customer with their user id
	customerParams.AddMeta("user_id", c.User.Id)
	// Create the new customer
	customer, err := customer.New(customerParams)
	if err != nil {
		clog.WithField("err", err).Error("Could not create customer")
		c.Render.JSON(w, http.StatusBadGateway, JsonErr("Could not "+
			"communicate with payment processor, please try again soon"))
		return
	}
	// Assign the id to the current user
	c.User.StripeCustomerId = customer.ID

	// Now update the user in the database
	if err := c.Api.User.Save(c.User); err != nil {
		clog.WithField("err", err).Error("Could not save user's stripe token")
		c.Render.JSON(w, http.StatusBadGateway, JsonErr("Could not save token"))
		return
	}

	user := c.User

	// Hydrate the user object
	if err = c.Api.User.Hydrate([]*models.User{user}); err != nil {
		clog.WithField("err", err).Error("Could not hydrate")
		return
	}

	c.Render.JSON(w, http.StatusOK, map[string]*models.User{"user": user})
}
