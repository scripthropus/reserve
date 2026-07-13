import { useState } from "react";

export default function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 w-full max-w-xs shadow">
        <h1 className="text-lg font-medium mb-4">ログイン</h1>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="ユーザ名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name && onLogin(name)}
        />
        <button
          className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
          disabled={!name}
          onClick={() => onLogin(name)}
        >
          ログイン
        </button>
      </div>
    </div>
  );
}