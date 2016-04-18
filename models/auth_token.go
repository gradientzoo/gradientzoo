package models

import (
	"database/sql"
	"time"

	"github.com/pborman/uuid"

	runner "gopkg.in/mgutz/dat.v1/sqlx-runner"
)

const AUTH_TOKEN_TABLE = "auth_token"

type AuthTokenDb struct {
	DB  *runner.DB
	Api *ApiCollection
}

//go:generate counterfeiter $GOFILE AuthTokenApi
type AuthTokenApi interface {
	ById(id interface{}) (*AuthToken, error)
	ByIds(ids []interface{}) ([]*AuthToken, error)
	Delete(id interface{}) error
	Save(*AuthToken) error
	Hydrate([]*AuthToken) error
	Truncate() error
}

func NewAuthTokenDb(db *runner.DB, api *ApiCollection) *AuthTokenDb {
	return &AuthTokenDb{
		DB:  db,
		Api: api,
	}
}

type AuthToken struct {
	Id          string    `db:"id" json:"id"`
	UserId      string    `db:"user_id" json:"user_id"`
	CreatedTime time.Time `db:"created_time" json:"created_time"`
}

func NewAuthToken(userId string) *AuthToken {
	return &AuthToken{
		Id:          uuid.NewRandom().String(),
		UserId:      userId,
		CreatedTime: time.Now().UTC(),
	}
}

func (db *AuthTokenDb) ById(id interface{}) (*AuthToken, error) {
	var authToken AuthToken
	err := db.DB.
		Select("*").
		From(AUTH_TOKEN_TABLE).
		Where("id = $1", id).
		QueryStruct(&authToken)
	if err == sql.ErrNoRows {
		return nil, err
	}
	return &authToken, err
}

func (db *AuthTokenDb) ByIds(ids []interface{}) ([]*AuthToken, error) {
	if len(ids) == 0 {
		return []*AuthToken{}, nil
	}
	var authTokens []*AuthToken
	err := db.DB.
		Select("*").
		From(AUTH_TOKEN_TABLE).
		Where("id IN $1", IdStrings(ids)).
		QueryStructs(&authTokens)
	if authTokens == nil {
		authTokens = []*AuthToken{}
	}
	return authTokens, err
}

func (db *AuthTokenDb) Delete(id interface{}) error {
	_, err := db.DB.
		DeleteFrom(AUTH_TOKEN_TABLE).
		Where("id = $1", id).
		Exec()
	return err
}

func (db *AuthTokenDb) Save(authToken *AuthToken) error {
	_, err := db.DB.
		InsertInto(AUTH_TOKEN_TABLE).
		Columns("id", "user_id", "created_time").
		Values(authToken.Id, authToken.UserId, authToken.CreatedTime).
		Exec()
	return err
}

func (db *AuthTokenDb) Hydrate(authTokens []*AuthToken) error {
	return nil
}

func (db *AuthTokenDb) Truncate() error {
	_, err := db.DB.DeleteFrom(AUTH_TOKEN_TABLE).Exec()
	return err
}
