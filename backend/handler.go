package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

type handler struct {
	db *DB
}

func newHandler(db *DB) *handler {
	return &handler{db: db}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *handler) list(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Query().Get("room_id")
	result, err := h.db.list(r.Context(), roomID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *handler) create(w http.ResponseWriter, r *http.Request) {
	var rv Reservation
	if err := json.NewDecoder(r.Body).Decode(&rv); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := validate(rv); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := h.db.create(r.Context(), &rv); err != nil {
		if strings.Contains(err.Error(), "no_double_booking") {
			http.Error(w, "double booking", http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusCreated, rv)
}

func (h *handler) update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	var rv Reservation
	if err := json.NewDecoder(r.Body).Decode(&rv); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := validate(rv); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	ok, err := h.db.update(r.Context(), id, rv)
	if err != nil {
		if strings.Contains(err.Error(), "no_double_booking") {
			http.Error(w, "double booking", http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !ok {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	rv.ID = id
	writeJSON(w, http.StatusOK, rv)
}

func (h *handler) delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	ok, err := h.db.delete(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !ok {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func validate(rv Reservation) error {
	if rv.RoomID == "" || rv.Organizer == "" || rv.Subject == "" {
		return errors.New("room_id, organizer, subject are required")
	}
	if !rv.EndsAt.After(rv.StartsAt) {
		return errors.New("ends_at must be after starts_at")
	}
	if rv.StartsAt.Minute()%5 != 0 || rv.EndsAt.Minute()%5 != 0 {
		return errors.New("time must be in 5-minute intervals")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
