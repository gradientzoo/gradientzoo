package models

import (
	"database/sql"
	"time"

	"github.com/pborman/uuid"
	"gopkg.in/guregu/null.v2/zero"
	runner "gopkg.in/mgutz/dat.v1/sqlx-runner"
)

const MODEL_TABLE = "model"

type ModelDb struct {
	DB  *runner.DB
	Api *ApiCollection
}

//go:generate counterfeiter $GOFILE ModelApi
type ModelApi interface {
	ById(id interface{}) (*Model, error)
	ByIds(ids []interface{}) ([]*Model, error)
	Delete(id interface{}) error
	Save(*Model) error
	Hydrate([]*Model) error
	Truncate() error

	// TODO: Potentially this should be a separate interface
	ByUserId(userId string) ([]*Model, error)
	ByUserIdSlug(userId, slug string) (*Model, error)
}

func NewModelDb(db *runner.DB, api *ApiCollection) *ModelDb {
	return &ModelDb{
		DB:  db,
		Api: api,
	}
}

type Model struct {
	Id          string    `db:"id" json:"id" msgpack:"id"`
	UserId      string    `db:"user_id" json:"user_id" msgpack:"user_id"`
	Slug        string    `db:"slug" json:"slug" msgpack:"slug"`
	Name        string    `db:"name" json:"name" msgpack:"name"`
	Description string    `db:"description" json:"description" msgpack:"description"`
	Visibility  string    `db:"visibility" json:"visibility" msgpack:"visibility"`
	Readme      string    `db:"readme" json:"-" msgpack:"-"`
	CreatedTime time.Time `db:"created_time" json:"created_time" msgpack:"created_time"`

	// Hydrated fields
	HydratedReadme zero.String `json:"readme,omitempty" msgpack:"readme,omitempty"`
}

func NewModel(userId, slug, name, description, visibility string) *Model {
	model := &Model{
		Id:          uuid.NewUUID().String(),
		UserId:      userId,
		Slug:        slug,
		Name:        name,
		Description: description,
		Visibility:  visibility,
		CreatedTime: time.Now().UTC(),
	}
	return model
}

func (db *ModelDb) ById(id interface{}) (*Model, error) {
	var model Model
	err := db.DB.
		Select("*").
		From(MODEL_TABLE).
		Where("id = $1", id).
		QueryStruct(&model)
	if err == sql.ErrNoRows {
		return nil, err
	}
	return &model, err
}

func (db *ModelDb) ByIds(ids []interface{}) ([]*Model, error) {
	var models []*Model
	err := db.DB.
		Select("*").
		From(MODEL_TABLE).
		Where("id IN $1", IdStrings(ids)).
		QueryStructs(&models)
	if models == nil {
		models = []*Model{}
	}
	return models, err
}

func (db *ModelDb) Delete(id interface{}) error {
	_, err := db.DB.
		DeleteFrom(MODEL_TABLE).
		Where("id = $1", id).
		Exec()
	return err
}

func (db *ModelDb) Save(model *Model) error {
	cols := []string{
		"id",
		"user_id",
		"slug",
		"name",
		"description",
		"visibility",
		"readme",
		"created_time",
	}
	vals := []interface{}{
		model.Id,
		model.UserId,
		model.Slug,
		model.Name,
		model.Description,
		model.Visibility,
		model.Readme,
		model.CreatedTime,
	}
	_, err := db.DB.
		Upsert(MODEL_TABLE).
		Columns(cols...).
		Values(vals...).
		Where("id = $1", model.Id).
		Exec()
	return err
}

func (db *ModelDb) Hydrate(models []*Model) error {
	for _, model := range models {
		model.HydratedReadme = zero.StringFrom(model.Readme)
	}
	return nil
}

func (db *ModelDb) Truncate() error {
	_, err := db.DB.DeleteFrom(MODEL_TABLE).Exec()
	return err
}

// -

func (db *ModelDb) ByUserId(userId string) ([]*Model, error) {
	var models []*Model
	err := db.DB.
		Select("*").
		From(MODEL_TABLE).
		Where("user_id = $1", userId).
		QueryStructs(&models)
	if models == nil {
		models = []*Model{}
	}
	return models, err
}

func (db *ModelDb) ByUserIdSlug(userId, slug string) (*Model, error) {
	var model Model
	err := db.DB.
		Select("*").
		From(MODEL_TABLE).
		Where("user_id = $1 AND slug = $2", userId, slug).
		QueryStruct(&model)
	if err == sql.ErrNoRows {
		return nil, err
	}
	return &model, err
}
