package api

import (
	"net/http"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/codegangsta/negroni"
	"github.com/ericflo/gradientzoo/blobstorage"
	"github.com/ericflo/gradientzoo/models"
	"github.com/ericflo/gradientzoo/utils"
	"github.com/julienschmidt/httprouter"
	"github.com/meatballhat/negroni-logrus"
	"github.com/phyber/negroni-gzip/gzip"
	"github.com/rs/cors"
	"gopkg.in/unrolled/render.v1"
)

type Handler func(c *Context, w http.ResponseWriter, req *http.Request)

var rndr *render.Render = render.New()
var api *models.ApiCollection
var blob blobstorage.BlobStorage

func handle(handler Handler) httprouter.Handle {
	return func(w http.ResponseWriter, req *http.Request, ps httprouter.Params) {
		var authToken *models.AuthToken
		var user *models.User
		if authTokenId := req.Header.Get("X-Auth-Token-Id"); authTokenId != "" {
			var err error
			if authToken, err = api.AuthToken.ById(authTokenId); err != nil {
				log.WithFields(log.Fields{
					"authTokenId": authTokenId,
					"err":         err.Error(),
				}).Error("Could not get auth token by id")
			} else if authToken != nil {
				if user, err = api.User.ById(authToken.UserId); err != nil {
					log.WithFields(log.Fields{
						"userId": authToken.UserId,
						"err":    err.Error(),
					}).Info("Could not get user by id")
				}
			}
		}
		c := &Context{
			Render:    rndr,
			Params:    ps,
			AuthToken: authToken,
			User:      user,
			Api:       api,
			Blob:      blob,
		}
		handler(c, w, req)
	}
}

func GET(r *httprouter.Router, path string, handler Handler) {
	r.GET(path, handle(handler))
}

func POST(r *httprouter.Router, path string, handler Handler) {
	r.POST(path, handle(handler))
}

func PUT(r *httprouter.Router, path string, handler Handler) {
	r.PUT(path, handle(handler))
}

func DELETE(r *httprouter.Router, path string, handler Handler) {
	r.DELETE(path, handle(handler))
}

func OPTIONS(r *httprouter.Router, path string, handler Handler) {
	r.OPTIONS(path, handle(handler))
}

func PATCH(r *httprouter.Router, path string, handler Handler) {
	r.PATCH(path, handle(handler))
}

func JsonErr(msg string) map[string]string {
	return map[string]string{"error": msg}
}

func Authed(h Handler) Handler {
	return Handler(func(c *Context, w http.ResponseWriter, req *http.Request) {
		if c.AuthToken == nil {
			c.Render.JSON(w, http.StatusUnauthorized,
				JsonErr("Must be authenticated to access this resource"))
		} else {
			h(c, w, req)
		}
	})
}

func makeHandler() http.Handler {
	router := httprouter.New()

	GET(router, "/", HandleIndex)
	POST(router, "/auth", HandleAuth)
	GET(router, "/auth/user", HandleAuthUser)
	POST(router, "/auth/logout", HandleLogout)
	//POST(router, "/image", HandleImageUpload)
	//POST(router, "/compare", HandleImageCompare)
	//GET(router, "/search/id/:id", HandleImageSearch)

	c := cors.New(cors.Options{
		AllowedOrigins:     []string{"http://localhost:8000", "http://localhost:3000"},
		AllowedHeaders:     []string{"X-Auth-Token-Id", "Content-Type", "Content-Length", "Accept", "Authorization"},
		OptionsPassthrough: false,
		AllowCredentials:   true,
		Debug:              false,
	})

	n := negroni.New(negroni.NewLogger())
	n.Use(c)
	n.Use(gzip.Gzip(gzip.BestCompression))
	n.Use(negronilogrus.NewMiddleware())
	n.UseHandler(router)

	return n
}

func Main() {
	if utils.Conf.Localdev {
		time.Sleep(10 * time.Second)
	}

	// Connect to the Postgres DB
	db, err := models.NewDB(false)
	if err != nil {
		log.WithFields(log.Fields{"err": err}).Error("Could not connect to db")
	}

	// Create API Collection
	api = models.NewApiCollection(db)

	// TODO: Migrate any models that need to be migrated
	//if err := api.Migrate(); err != nil {
	//	log.WithFields(log.Fields{"err": err}).Error("Could not migrate")
	//	return
	//}

	// Initialize blob storage
	blob = blobstorage.NewS3BlobStorage(
		utils.Conf.AWSBucket,
		utils.Conf.AWSRegion,
	)

	// Make the HTTP handlers
	handler := makeHandler()

	// Start the HTTP server
	log.WithFields(log.Fields{"port": utils.Conf.Port}).Info("Serving")
	http.ListenAndServe(":"+utils.Conf.Port, handler)
}
