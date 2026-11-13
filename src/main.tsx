import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Confidentialite, MentionsLegales } from "./Legal";

const page = document.body.dataset.page;
const Composant = page === "mentions" ? MentionsLegales : page === "confidentialite" ? Confidentialite : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Composant />
  </StrictMode>,
);
