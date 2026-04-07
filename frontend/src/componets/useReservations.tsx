import { useState, useEffect } from "react";
import type { Reservation, ReservationInput } from "../types";

const BASE = "https://tdu-fr-reserve.quest/api";

export function useReservations() {
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetch_ = () => {
		setLoading(true);
		fetch(`${BASE}/reservations`)
			.then((r) => r.json())
			.then(setReservations)
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetch_();
	}, []);

	const create = async (input: ReservationInput): Promise<string | null> => {
		const r = await fetch(`${BASE}/reservations`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		});
		if (r.status === 409) return "ダブルブッキングです";
		if (!r.ok) return "エラーが発生しました";
		fetch_();
		return null;
	};

	const update = async (
		id: number,
		input: ReservationInput,
	): Promise<string | null> => {
		const r = await fetch(`${BASE}/reservations/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		});
		if (r.status === 409) return "ダブルブッキングです";
		if (!r.ok) return "エラーが発生しました";
		fetch_();
		return null;
	};

	const remove = async (id: number): Promise<string | null> => {
		const r = await fetch(`${BASE}/reservations/${id}`, { method: "DELETE" });
		if (!r.ok) return "エラーが発生しました";
		fetch_();
		return null;
	};

	return { reservations, loading, error, create, update, remove };
}
