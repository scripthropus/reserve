package main

import (
	"log"
	"net/http"
)

func main() {
	db, err := newDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	h := newHandler(db)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /reservations", h.list)
	mux.HandleFunc("POST /reservations", h.create)
	mux.HandleFunc("PUT /reservations/{id}", h.update)
	mux.HandleFunc("DELETE /reservations/{id}", h.delete)

	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", corsMiddleware(mux)))
}
