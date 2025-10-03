// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";     // keep App as the entry
import "./styles.css";           // import the global styles

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
