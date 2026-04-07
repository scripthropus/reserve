export type Reservation = {
	id: number;
	room_id: string;
	organizer: string;
	subject: string;
	reason: string;
	starts_at: string;
	ends_at: string;
};

export type ReservationInput = Omit<Reservation, "id">;
