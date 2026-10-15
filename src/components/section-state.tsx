import { Newspaper, Search, Shield, Trophy, UserRound } from "lucide-react";

const icons = { ligas: Trophy, equipos: Shield, jugadores: UserRound, noticias: Newspaper, buscar: Search };
type Section = keyof typeof icons;

export function SectionState({ section, title, description }: { section: Section; title: string; description: string }) {
  const Icon = icons[section];
  return <main className="mx-auto flex min-h-[65vh] max-w-7xl items-center px-5 py-12 lg:px-8">
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white px-7 py-12 text-center shadow-sm sm:px-12">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-cancha"><Icon size={24} /></span>
      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.17em] text-cancha">Cancha · en desarrollo</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </section>
  </main>;
}
