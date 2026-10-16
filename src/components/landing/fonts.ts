// Fonts are loaded only for the landing page (scoped by the CSS variables
// below), so the dashboard keeps whatever it uses today.
import { Bricolage_Grotesque, Geist } from "next/font/google";

export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-lp-display",
  display: "swap",
});

export const bodyFont = Geist({
  subsets: ["latin"],
  variable: "--font-lp-body",
  display: "swap",
});
