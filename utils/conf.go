package utils

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Flavor     string
	Production bool
	Port       string

	PostgresqlHost     string
	PostgresqlPort     int
	PostgresqlDbName   string
	PostgresqlUser     string
	PostgresqlPassword string
	PostgresqlSslMode  string

	StripeSecretLive string
	StripeSecretTest string

	AWSBucket          string
	AWSRegion          string
	AWSAccessKeyId     string // Unused, just used to remind you to set the env
	AWSSecretAccessKey string // vars AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
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
	Flavor:     os.Getenv("FLAVOR"),
	Production: os.Getenv("FLAVOR") == "production",
	Port:       EnvDef("PORT", "8000"),

	PostgresqlHost:     HostDef("GRADIENTZOO_POSTGRES_SVC", EnvDefInt("POSTGRESQL_PORT", 5432), "localhost"),
	PostgresqlPort:     EnvDefInt("POSTGRESQL_PORT", 5432),
	PostgresqlDbName:   EnvDef("POSTGRESQL_NAME", "gradientzoo"),
	PostgresqlUser:     EnvDef("POSTGRESQL_USER", "gradientzoo"),
	PostgresqlPassword: EnvDef("POSTGRESQL_PASSWORD", "gradientzoo"),
	PostgresqlSslMode:  EnvDef("POSTGRESQL_SSLMODE", "disable"),

	StripeSecretLive: EnvDef("STRIPE_SECRET_LIVE", ""),
	StripeSecretTest: EnvDef("STRIPE_SECRET_TEST", ""),

	AWSBucket:          EnvDef("AWS_BUCKET", "gradientzoo-1"),
	AWSRegion:          EnvDef("AWS_REGION", "us-west-2"),
	AWSAccessKeyId:     EnvDef("AWS_ACCESS_KEY_ID", ""),
	AWSSecretAccessKey: EnvDef("AWS_SECRET_ACCESS_KEY", ""),
}

func EnvDef(name, def string) string {
	ret := os.Getenv(name)
	if ret == "" {
		ret = def
	}
	return strings.TrimSpace(ret)
}

func EnvEnsure(name string) string {
	ret := os.Getenv(name)
	if ret == "" {
		log.Fatalln("Must provide a " + name + " environment variable")
	}
	return strings.TrimSpace(ret)
}

func EnvInt(name string) int {
	i, err := strconv.Atoi(strings.TrimSpace(os.Getenv(name)))
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

	return strings.TrimSpace(host)
}
