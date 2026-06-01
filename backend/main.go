package main

import (
	"log"
	"net/http"

	"github.com/harness-engineering-test/copilot-pipeline/backend/handler"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handler.Health)

	log.Println("starting server on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
