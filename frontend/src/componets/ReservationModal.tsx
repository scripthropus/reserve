import { useState } from "react";
import type { Reservation, ReservationInput } from "../types";
import { formatTime } from "./ReservationGrid";

type Props = {
	date: Date;
	roomId: string;
	reservation?: Reservation;
	onSubmit: (input: ReservationInput) => Promise<string | null>;
	onDelete?: () => Promise<string | null>;
	onClose: () => void;
};

function toISO(date: Date, time: string): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return new Date(`${y}-${m}-${d}T${time}:00+09:00`).toISOString();
}

const timeOptions = Array.from({ length: 25 * 12 }, (_, i) => {
	const h = Math.floor(i / 12) + 9;
	const m = (i % 12) * 5;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}).filter((t) => t <= "21:00");

function formatDate(date: Date): string {
	const m = date.getMonth() + 1;
	const d = date.getDate();
	const dow = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
	return `${m}月${d}日（${dow}）`;
}

export default function ReservationModal({
	date,
	roomId,
	reservation,
	onSubmit,
	onDelete,
	onClose,
}: Props) {
	const isEdit = !!reservation;

	const [organizer, setOrganizer] = useState(reservation?.organizer ?? "");
	const [subject, setSubject] = useState(reservation?.subject ?? "");
	const [reason, setReason] = useState(reservation?.reason ?? "");
	const [startsAt, setStartsAt] = useState(
		reservation ? formatTime(reservation.starts_at) : "09:20",
	);
	const [endsAt, setEndsAt] = useState(
		reservation ? formatTime(reservation.ends_at) : "10:50",
	);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		setLoading(true);
		setError(null);
		const err = await onSubmit({
			room_id: roomId,
			organizer,
			subject,
			reason,
			starts_at: toISO(date, startsAt),
			ends_at: toISO(date, endsAt),
		});
		setLoading(false);
		if (err) {
			setError(err);
			return;
		}
		onClose();
	};

	const handleDelete = async () => {
		if (!onDelete) return;
		setLoading(true);
		const err = await onDelete();
		setLoading(false);
		if (err) {
			setError(err);
			return;
		}
		onClose();
	};

	return (
		<div
			className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg"
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className="text-base font-medium mb-4">
					{isEdit ? "予約を編集" : "新規予約"} — {roomId}／{formatDate(date)}
				</h2>

				{error && <p className="text-red-500 text-sm mb-3">{error}</p>}

				<div className="space-y-3">
					<Field label="氏名・団体名">
						<input
							className={input}
							value={organizer}
							onChange={(e) => setOrganizer(e.target.value)}
						/>
					</Field>
					<Field label="教科・内容">
						<input
							className={input}
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
						/>
					</Field>
					<Field label="理由">
						<input
							className={input}
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</Field>
					<Field label="開始">
						<select
							className={input}
							value={startsAt}
							onChange={(e) => setStartsAt(e.target.value)}
						>
							{timeOptions.map((t) => (
								<option key={t}>{t}</option>
							))}
						</select>
					</Field>
					<Field label="終了">
						<select
							className={input}
							value={endsAt}
							onChange={(e) => setEndsAt(e.target.value)}
						>
							{timeOptions.map((t) => (
								<option key={t}>{t}</option>
							))}
						</select>
					</Field>
				</div>

				<div className="flex gap-2 mt-5">
					{isEdit && (
						<button
							className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
							onClick={handleDelete}
							disabled={loading}
						>
							削除
						</button>
					)}
					<div className="flex-1" />
					<button
						className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
						onClick={onClose}
					>
						キャンセル
					</button>
					<button
						className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
						onClick={handleSubmit}
						disabled={loading}
					>
						{isEdit ? "更新" : "予約"}
					</button>
				</div>
			</div>
		</div>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className="text-xs text-gray-500 mb-1 block">{label}</label>
			{children}
		</div>
	);
}

const input =
	"w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";
