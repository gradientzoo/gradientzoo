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
	negronilogrus "github.com/meatballhat/negroni-logrus"
	"github.com/phyber/negroni-gzip/gzip"
	render "gopkg.in/unrolled/render.v1"
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
	GET(router, "/auth/user", HandleAuthUser)
	POST(router, "/auth/login", HandleLogin)
	POST(router, "/auth/register", HandleRegister)
	POST(router, "/auth/logout", HandleLogout)
	POST(router, "/model/create", Authed(HandleCreateModel))
	GET(router, "/user/username/:username", HandleUserByUsername)
	GET(router, "/models/username/:username", HandleModelsByUsername)
	GET(router, "/models/public/latest", HandleLatestPublicModels)
	GET(router, "/models/public/top/:period", HandleTopPublicModels)
	GET(router, "/model/username/:username/slug/:slug", HandleModelByUsernameAndSlug)
	POST(router, "/model/id/:id/readme", Authed(HandleUpdateModelReadme))
	POST(router, "/model/id/:id/deleted", Authed(HandleDeleteModel))
	POST(router, "/file/:username/:slug/:framework/:filename", Authed(HandleFileUpload))
	GET(router, "/file/:username/:slug/:framework/:filename", HandleFile)
	GET(router, "/file-id/:id", HandleFileById)
	GET(router, "/file-versions/:username/:slug/:framework/:filename", HandleFileVersions)
	GET(router, "/model/username/:username/slug/:slug/latest-files", HandleLatestFilesByUsernameAndSlug)

	n := negroni.New(negroni.NewLogger())

	// In production, redirect all traffic to https (except /, for LB health check)
	if utils.Conf.Production {
		n.UseHandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
			if r.URL.Path != "/" && r.Header.Get("X-Forwarded-Proto") != "https" {
				http.RedirectHandler(
					"https://"+r.Host+r.URL.RequestURI(),
					http.StatusFound,
				).ServeHTTP(rw, r)
			}
		})
	}

	n.Use(gzip.Gzip(gzip.BestCompression))
	n.Use(negronilogrus.NewMiddleware())
	n.UseHandler(router)

	return n
}

func Main() {
	if !utils.Conf.Production {
		log.Info("Initializing, please wait...")
		time.Sleep(10 * time.Second)
	}

	// Connect to the Postgres DB
	db, err := models.NewDB()
	if err != nil {
		log.WithFields(log.Fields{"err": err}).Error("Could not connect to db")
	}

	// Create API Collection
	api = models.NewApiCollection(db)

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
