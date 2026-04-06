import { useState, useEffect } from "react";
import type { Reservation } from "../types.ts";

const BASE = "https://tdu-fr-reserve.quest/api";

export default function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/reservations`)
      .then(r => r.json())
      .then(setReservations)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { reservations, loading, error };
}