package models

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/ericflo/gradientzoo/utils"
	_ "github.com/lib/pq"
	dat "gopkg.in/mgutz/dat.v1"
	runner "gopkg.in/mgutz/dat.v1/sqlx-runner"
)

type Scannable interface {
	Scan(dest ...interface{}) error
}

type BackendModel interface {
	Truncate() error
}

type ApiCollection struct {
	User      UserApi
	AuthToken AuthTokenApi
	Model     ModelApi
	File      FileApi
}

func NewApiCollection(db *runner.DB) *ApiCollection {
	api := &ApiCollection{}
	api.User = NewUserDb(db, api)
	api.AuthToken = NewAuthTokenDb(db, api)
	api.Model = NewModelDb(db, api)
	api.File = NewFileDb(db, api)
	return api
}

func (api *ApiCollection) BackendModels() []BackendModel {
	return []BackendModel{
		BackendModel(api.User),
		BackendModel(api.AuthToken),
		BackendModel(api.Model),
		BackendModel(api.File),
	}
}

func (api *ApiCollection) Truncate() error {
	for _, backendModel := range api.BackendModels() {
		if err := backendModel.Truncate(); err != nil {
			return err
		}
	}
	return nil
}

// DB Opener Util

func NewDB(test bool) (*runner.DB, error) {
	var dsn string
	if test {
		dsn = fmt.Sprintf(
			"dbname=%s user=%s password=%s host=%s port=%d sslmode=%s",
			utils.Conf.PostgresqlTestDbName,
			utils.Conf.PostgresqlTestUser,
			utils.Conf.PostgresqlTestPassword,
			utils.Conf.PostgresqlTestHost,
			utils.Conf.PostgresqlTestPort,
			utils.Conf.PostgresqlTestSslMode,
		)
	} else {
		dsn = fmt.Sprintf(
			"dbname=%s user=%s password=%s host=%s port=%d sslmode=%s",
			utils.Conf.PostgresqlDbName,
			utils.Conf.PostgresqlUser,
			utils.Conf.PostgresqlPassword,
			utils.Conf.PostgresqlHost,
			utils.Conf.PostgresqlPort,
			utils.Conf.PostgresqlSslMode,
		)
	}
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	//runner.MustPing(db)

	// Set to reasonable values for production
	db.SetMaxIdleConns(2)
	db.SetMaxOpenConns(4)

	dat.EnableInterpolation = true
	dat.Strict = false

	// Log any query over 50ms as warnings
	runner.LogQueriesThreshold = 50 * time.Millisecond

	return runner.NewDB(db, "postgres"), nil
}

func IdStrings(ids []interface{}) []string {
	idStrs := make([]string, len(ids))
	for i, id := range ids {
		idStrs[i] = id.(string)
	}
	return idStrs
}
