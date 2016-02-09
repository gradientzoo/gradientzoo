package utils

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Localdev bool
	Port     string

	PostgresqlHost     string
	PostgresqlPort     int
	PostgresqlDbName   string
	PostgresqlUser     string
	PostgresqlPassword string
	PostgresqlSslMode  string

	PostgresqlTestHost     string
	PostgresqlTestPort     int
	PostgresqlTestDbName   string
	PostgresqlTestUser     string
	PostgresqlTestPassword string
	PostgresqlTestSslMode  string

	AWSBucket string
	AWSRegion string
}

func (c Config) Valid() bool {
	strs := []string{
		c.Port,
		c.AWSBucket,
		c.AWSRegion,
	}
	for _, s := range strs {
		if s == "" {
			return false
		}
	}
	return true
}

var Conf Config = Config{
	Localdev: os.Getenv("LOCALDEV") != "",
	Port:     EnvDef("PORT", "8000"),

	/*
		PostgresqlHost:     HostDef("POSTGRESQL", 5432, "localhost"),
		PostgresqlPort:     EnvDefInt("POSTGRESQL_DB_PORT", 5432),
		PostgresqlDbName:   EnvDef("POSTGRESQL_DB_NAME", "gradientzoo"),
		PostgresqlUser:     EnvDef("POSTGRESQL_DB_USER", "gradientzoo"),
		PostgresqlPassword: EnvDef("POSTGRESQL_DB_PASSWORD", "gradientzoo"),
		PostgresqlSslMode:  EnvDef("POSTGRESQL_DB_SSLMODE", "disable"),
	*/
	PostgresqlHost:     HostDef("POSTGRESQL", 5432, "ec2-54-204-6-113.compute-1.amazonaws.com"),
	PostgresqlPort:     EnvDefInt("POSTGRESQL_DB_PORT", 5432),
	PostgresqlDbName:   EnvDef("POSTGRESQL_DB_NAME", "d9idmh83ri9br2"),
	PostgresqlUser:     EnvDef("POSTGRESQL_DB_USER", "avjsbzrnjkjfir"),
	PostgresqlPassword: EnvDef("POSTGRESQL_DB_PASSWORD", "bdNaXH2NChX3xqcW9qtG96JvB-"),
	PostgresqlSslMode:  EnvDef("POSTGRESQL_DB_SSLMODE", "require"),

	PostgresqlTestHost:     HostDef("POSTGRESQLTST", 5432, "localhost"),
	PostgresqlTestPort:     EnvDefInt("POSTGRESQL_TEST_DB_PORT", 5432),
	PostgresqlTestDbName:   EnvDef("POSTGRESQL_TEST_DB_NAME", "test"),
	PostgresqlTestUser:     EnvDef("POSTGRESQL_TEST_DB_USER", "test"),
	PostgresqlTestPassword: EnvDef("POSTGRESQL_TEST_DB_PASSWORD", "test"),

	AWSBucket: EnvDef("AWS_BUCKET", "gradientzoo"),
	AWSRegion: EnvDef("AWS_REGION", "us-west-2"),
}

func EnvDef(name, def string) string {
	ret := os.Getenv(name)
	if ret == "" {
		ret = def
	}
	return ret
}

func EnvEnsure(name string) string {
	ret := os.Getenv(name)
	if ret == "" {
		log.Fatalln("Must provide a " + name + " environment variable")
	}
	return ret
}

func EnvInt(name string) int {
	i, err := strconv.Atoi(os.Getenv(name))
	if err != nil {
		log.Fatalln(err)
	}
	return i
}

func EnvDefInt(name string, def int) int {
	i, err := strconv.Atoi(EnvDef(name, fmt.Sprintf("%d", def)))
	if err != nil {
		log.Fatalln(err)
	}
	return i
}

func Host(name string, port int) string {
	return HostDef(name, port, "")
}

func HostDef(name string, port int, def string) string {
	upperName := strings.ToUpper(name)

	// These are the two environment variables we're going to try
	env1 := fmt.Sprintf("%s_SERVICE_HOST", upperName)
	env2 := fmt.Sprintf("%s_1_PORT_%d_TCP_ADDR", upperName, port)

	// Try the first one
	host := os.Getenv(env1)
	if host == "" {
		// Fall back to the second one
		host = os.Getenv(env2)
	}

	// If we still haven't gotten a hostname, use the default
	if host == "" {
		host = def
	}

	return host
}
