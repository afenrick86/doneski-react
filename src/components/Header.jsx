import { useNavigate } from "react-router-dom";
// import { useDarkMode } from "../hooks/useDarkMode.js";

export default function Header() {
  const navigate = useNavigate();
  // const [isDark, toggleDark] = useDarkMode();

  return (
    <header>
      <img
        id="site-logo"
        src="/doneski-logo.svg"
        alt="Doneski"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      />
      {/* <button id="theme-toggle" onClick={toggleDark}>{isDark ? "☀️" : "🌙"}</button> */}
    </header>
  );
}
