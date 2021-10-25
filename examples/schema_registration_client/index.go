package main

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"os"
	"fmt"
	"github.com/sirupsen/logrus"
	"net/http"
	"time"
)

// I'm writing to .version on build time:
//git rev-parse --short HEAD > .version
//go:embed .version
var version string

func RegisterGraphQLSchema(graphqlSchema string, log *logrus.Logger) error {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	var service string

	service = "https://localhost:6001"

	requestBody, err := json.Marshal(map[string]string{
		"name":      os.Getenv("SERVICE_NAME"), // change me
		"version":   version,
		"type_defs": graphqlSchema,
	})
	if err != nil {
		log.Error(err)
		return err
	}

	response, err := client.Post(
		fmt.Sprintf("%v/schema/push", service),
		"application/json",
		bytes.NewBuffer(requestBody),
	)

	if err != nil {
		log.Error(err)
		return err
	}

	var res map[string]interface{}

	_ = json.NewDecoder(response.Body).Decode(&res)

	log.Info(res["json"])
	return nil
}
