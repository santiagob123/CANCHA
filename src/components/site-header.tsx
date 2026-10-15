import Link from "next/link";
import { Search } from "lucide-react";

const links = [
  ["Resultados", "/resultados"],
  ["Ligas", "/ligas"],
  ["Equipos", "/equipos"],
  ["Jugadores", "/jugadores"],
  ["Noticias", "/noticias"],
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Cancha, inicio">
          <span className="grid size-10 place-items-center rounded-xl bg-cancha text-white"><span className="text-xl">⚽</span></span>
          <span className="text-xl font-black tracking-tight text-slate-950">cancha<span className="text-cancha">.</span></span>
        </Link>
        <nav aria-label="Navegación principal" className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">{label}</Link>)}
        </nav>
        <Link href="/buscar" aria-label="Buscar" className="grid size-10 place-items-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-400"><Search size={18} /></Link>
      </div>
      <nav aria-label="Navegación móvil" className="flex gap-5 overflow-x-auto border-t border-slate-100 px-5 py-3 md:hidden">
        {links.map(([label, href]) => <Link key={href} href={href} className="whitespace-nowrap text-xs font-bold text-slate-600">{label}</Link>)}
      </nav>
    </header>
  );
}
