import { useMemo, useState } from "react";
import { useReservations } from "./useReservations";
import ReservationModal from "./ReservationModal";
import type { Reservation } from "../types";

const DAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

function getWeekDays(): Date[] {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const monday = new Date(today);
	monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		return d;
	});
}

function isSameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export function formatTime(dateStr: string): string {
	return new Date(dateStr).toLocaleTimeString("ja-JP", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Tokyo",
	});
}

type Props = { currentUser: string };

type ModalState =
	| { mode: "create"; date: Date; roomId: string }
	| { mode: "edit"; reservation: Reservation };

export default function ReservationGrid({ currentUser }: Props) {
	const days = getWeekDays();
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const { reservations, loading, error, create, update, remove } =
		useReservations();
	const [modal, setModal] = useState<ModalState | null>(null);

	const rooms = useMemo(
		() => [...new Set(reservations.map((r) => r.room_id))].sort(),
		[reservations],
	);

	if (loading) return <div className="p-4 text-gray-400">読み込み中...</div>;
	if (error) return <div className="p-4 text-red-500">{error}</div>;

	return (
		<>
			<div className="overflow-x-auto">
				<table className="border-collapse min-w-full text-sm">
					<thead>
						<tr>
							<th className="border border-gray-200 px-3 py-2 bg-gray-50 font-medium text-left min-w-28 whitespace-nowrap">
								教室
							</th>
							{days.map((d, i) => {
								const isToday = isSameDay(d, today);
								const isWeekend = i >= 5;
								return (
									<th
										key={i}
										className={`border border-gray-200 px-3 py-2 font-medium text-center min-w-24 whitespace-nowrap
                      ${isWeekend ? "bg-gray-100" : "bg-gray-50"}
                      ${isToday ? "text-blue-600" : "text-gray-600"}
                    `}
									>
										{`${d.getMonth() + 1}/${d.getDate()}（${DAY_JA[d.getDay()]}）`}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{rooms.map((room) => (
							<tr key={room}>
								<th className="border border-gray-200 px-3 py-2 bg-gray-50 font-medium text-left whitespace-nowrap">
									{room}
								</th>
								{days.map((d, i) => {
									const isWeekend = i >= 5;
									const entries = reservations
										.filter(
											(r) =>
												r.room_id === room &&
												isSameDay(new Date(r.starts_at), d),
										)
										.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
									return (
										<td
											key={i}
											className={`border border-gray-200 px-2 py-1 align-top min-w-24
                        ${isWeekend ? "bg-gray-50" : "bg-white"}
                        hover:bg-blue-50 cursor-pointer transition-colors
                      `}
											onClick={() =>
												setModal({ mode: "create", date: d, roomId: room })
											}
										>
											{entries.map((e) => (
												<div
													key={e.id}
													className="text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 mb-0.5 cursor-pointer hover:bg-blue-200"
													onClick={(ev) => {
														ev.stopPropagation();
														setModal({ mode: "edit", reservation: e });
													}}
												>
													<span className="text-blue-500">
														{formatTime(e.starts_at)}〜{formatTime(e.ends_at)}
													</span>
													<br />
													{e.organizer}・{e.subject}
												</div>
											))}
                        <div className="min-h-8"/>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{modal?.mode === "create" && (
				<ReservationModal
					date={modal.date}
					roomId={modal.roomId}
					currentUser={currentUser}
					onSubmit={create}
					onClose={() => setModal(null)}
				/>
			)}
			{modal?.mode === "edit" && (
				<ReservationModal
					date={new Date(modal.reservation.starts_at)}
					roomId={modal.reservation.room_id}
					currentUser={currentUser}
					reservation={modal.reservation}
					onSubmit={(input) => update(modal.reservation.id, input)}
					onDelete={() => remove(modal.reservation.id)}
					onClose={() => setModal(null)}
				/>
			)}
		</>
	);
}
