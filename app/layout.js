import "./globals.css";
import ThemeToggle from "./components/ThemeToggle.js";

export const metadata = {
  title: "Fitalert — Fitness that fits your life",
  description:
    "Build a training rhythm that works for you with guided workouts, plans, food tracking, and coach discovery.",
}; //

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
