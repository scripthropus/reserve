import { useMemo } from "react";
import useReservations from "./useReservations.tsx";

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
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function ReservationGrid() {
  const days = getWeekDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { reservations, loading, error } = useReservations();
  const rooms = useMemo(() =>
    [...new Set(reservations.map(r => r.room_id))].sort(),
    [reservations]
  );

  if (loading) return <div className="p-4 text-gray-400">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
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
          {rooms.map(room => (
            <tr key={room}>
              <th className="border border-gray-200 px-3 py-2 bg-gray-50 font-medium text-left whitespace-nowrap">
                {room}
              </th>
              {days.map((d, i) => {
                const isWeekend = i >= 5;
                const entries = reservations.filter(r =>
                  r.room_id === room && isSameDay(new Date(r.starts_at), d)
                );
                return (
                  <td
                    key={i}
                    className={`border border-gray-200 px-2 py-1 h-12 align-top
                      ${isWeekend ? "bg-gray-50" : "bg-white"}
                      hover:bg-blue-50 cursor-pointer transition-colors
                    `}
                  >
                    {entries.map(e => (
                      <div
                        key={e.id}
                        className="text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 mb-0.5"
                      >
                        {e.organizer}・{e.subject}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}