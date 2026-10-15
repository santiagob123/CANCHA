import type { Metadata } from "next";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Cancha — El fútbol, claro y al día", template: "%s | Cancha" },
  description: "Resultados, calendario y actualidad del fútbol en un solo lugar.",
  openGraph: { title: "Cancha — El fútbol, claro y al día", description: "Resultados y calendario de fútbol.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><SiteHeader />{children}<footer className="mt-16 border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© {new Date().getFullYear()} Cancha. Fútbol con datos claros.</span><span>Los datos deportivos se muestran según la disponibilidad de la fuente.</span></div></footer></body></html>;
}
