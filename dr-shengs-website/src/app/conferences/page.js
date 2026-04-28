import { ConferencesClient } from "./ConferencesClient";

export const metadata = {
  title: "Conferences · Machine Learning & Data Science Lab",
  description: "Upcoming conferences and events from the ML & Data Science Lab.",
};

export default function ConferencesPage() {
  return <ConferencesClient />;
}
