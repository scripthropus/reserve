package main

import (
	"context"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func getDSN() string {
	if dsn := os.Getenv("DATABASE_URL"); dsn != "" {
		return dsn
	}
	return ""
}

type Reservation struct {
	ID        int       `json:"id,omitempty"`
	RoomID    string    `json:"room_id"`
	Organizer string    `json:"organizer"`
	Subject   string    `json:"subject"`
	Reason    string    `json:"reason"`
	StartsAt  time.Time `json:"starts_at"`
	EndsAt    time.Time `json:"ends_at"`
}

type DB struct {
	pool *pgxpool.Pool
}

func newDB() (*DB, error) {
	pool, err := pgxpool.New(context.Background(), getDSN)
	if err != nil {
		return nil, err
	}
	return &DB{pool: pool}, nil
}

func (db *DB) Close() {
	db.pool.Close()
}

func (db *DB) list(ctx context.Context, roomID string) ([]Reservation, error) {
	var rows pgx.Rows
	var err error
	if roomID != "" {
		rows, err = db.pool.Query(ctx, `
			SELECT id, room_id, organizer, subject, reason, starts_at, ends_at
			FROM reservations WHERE room_id = $1 ORDER BY starts_at`, roomID)
	} else {
		rows, err = db.pool.Query(ctx, `
			SELECT id, room_id, organizer, subject, reason, starts_at, ends_at
			FROM reservations ORDER BY starts_at`)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := []Reservation{}
	for rows.Next() {
		var rv Reservation
		if err := rows.Scan(&rv.ID, &rv.RoomID, &rv.Organizer, &rv.Subject, &rv.Reason, &rv.StartsAt, &rv.EndsAt); err != nil {
			return nil, err
		}
		result = append(result, rv)
	}
	return result, nil
}

func (db *DB) create(ctx context.Context, rv *Reservation) error {
	return db.pool.QueryRow(ctx, `
		INSERT INTO reservations (room_id, organizer, subject, reason, starts_at, ends_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`,
		rv.RoomID, rv.Organizer, rv.Subject, rv.Reason, rv.StartsAt, rv.EndsAt,
	).Scan(&rv.ID)
}

func (db *DB) update(ctx context.Context, id int, rv Reservation) (bool, error) {
	tag, err := db.pool.Exec(ctx, `
		UPDATE reservations
		SET room_id=$1, organizer=$2, subject=$3, reason=$4, starts_at=$5, ends_at=$6, updated_at=NOW()
		WHERE id=$7`,
		rv.RoomID, rv.Organizer, rv.Subject, rv.Reason, rv.StartsAt, rv.EndsAt, id,
	)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}

func (db *DB) delete(ctx context.Context, id int) (bool, error) {
	tag, err := db.pool.Exec(ctx, `DELETE FROM reservations WHERE id=$1`, id)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}
