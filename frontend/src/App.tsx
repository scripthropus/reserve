import { useState } from "react";
import ReservationGrid from "./componets/ReservationGrid";
import Login from "./componets/Login";

function App() {
  const [user, setUser] = useState<string | null>(
    () => localStorage.getItem("user")
  );

  const handleLogin = (name: string) => {
    localStorage.setItem("user", name);
    setUser(name);
  };

  if (!user) return <Login onLogin={handleLogin} />;
  return <ReservationGrid currentUser={user} />;
}
export default App;