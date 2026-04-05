package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, `{"message": "hello"}`)
	})
	http.ListenAndServe(":8080", nil)
}
