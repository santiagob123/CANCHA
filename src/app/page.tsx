import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Newspaper, Trophy } from "lucide-react";
import { FixtureCard } from "../components/fixture-card";
import { getFixtures, groupByLeague } from "../lib/football/service";
import Image from "next/image";

function getTodayInTimezone(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default async function HomePage() {
  const timezone = process.env.APP_TIME_ZONE || "America/Bogota";
  const today = getTodayInTimezone(timezone);
  const result = await getFixtures(today);
  const groups = result.ok ? groupByLeague(result.fixtures) : [];
  const liveCount = result.ok ? result.fixtures.filter((fixture) => fixture.status === "live" || fixture.status === "halftime").length : 0;
  const dateLabel = new Intl.DateTimeFormat("es-CO", { dateStyle: "full", timeZone: timezone }).format(new Date());

  return (
    <main className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-8 lg:pt-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium capitalize text-slate-500">{dateLabel}</p>
        <Link href={`/resultados?date=${today}`} className="inline-flex items-center gap-2 text-sm font-bold text-cancha hover:underline">Ver todos los resultados <ArrowRight size={16} /></Link>
      </div>
      <section className="relative isolate overflow-hidden rounded-3xl bg-[#10231d] px-6 py-9 text-white sm:px-10 sm:py-12">
        <div aria-hidden="true" className="absolute -right-10 -top-28 -z-10 size-96 rounded-full border-[42px] border-white/[0.04]" />
        <div className="absolute bottom-0 right-0 -z-10 h-1 w-full bg-gradient-to-r from-transparent via-emerald-500 to-lime-300" />
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200"><span className="size-1.5 rounded-full bg-emerald-400" /> Tu fútbol, en un solo lugar</span>
          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">El juego se vive.<br /><span className="text-emerald-300">Cancha lo cuenta.</span></h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">Marcadores, calendario y competiciones. La información deportiva, clara y al día.</p>
          <Link href="/resultados" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-extrabold text-emerald-950 transition hover:bg-emerald-300">Explorar resultados <ArrowRight size={16} /></Link>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cancha">Jornada de hoy</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Partidos y resultados</h2></div>
            <Link href={`/resultados?date=${today}`} aria-label="Ir a resultados" className="grid size-9 place-items-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100"><ChevronRight size={18} /></Link>
          </div>
          {result.ok && result.fixtures.length > 0 ? groups.map((group) => (
            <div key={group.league.id}>
              <div className="flex items-center gap-2 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 sm:px-6">
                {group.league.logo && <Image src={group.league.logo} alt="" width={18} height={18} className="size-[18px] object-contain" />}
                <span>{group.league.name}</span>{group.league.country && <span className="font-medium text-slate-400">· {group.league.country}</span>}
              </div>
              {group.fixtures.map((fixture) => <FixtureCard key={fixture.id} fixture={fixture} />)}
            </div>
          )) : <div className="mx-5 mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center sm:mx-6">
            <div className="mx-auto grid size-11 place-items-center rounded-full bg-white text-slate-400 shadow-sm"><CalendarDays size={20} /></div>
            <h3 className="mt-3 text-sm font-bold text-slate-800">{result.ok ? "No hay partidos para hoy" : result.code === "not_configured" ? "Marcadores disponibles al configurar la API" : "No se pudieron cargar los partidos"}</h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">{result.ok ? "Consulta otra fecha para ver encuentros anteriores o próximos." : result.message}</p>
            {result.ok && <Link href="/resultados" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cancha">Ir al calendario <ArrowRight size={14} /></Link>}
          </div>}
          {result.ok && result.fixtures.length > 0 && liveCount > 0 && <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-6">{liveCount} {liveCount === 1 ? "partido en juego" : "partidos en juego"} · datos según disponibilidad del proveedor</p>}
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-cancha"><Trophy size={18} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Encuentra tu torneo</p><h2 className="text-base font-black text-slate-900">Competiciones</h2></div></div>
            <p className="mt-4 text-sm leading-6 text-slate-500">Explora ligas y torneos disponibles en la fuente deportiva.</p>
            <Link href="/ligas" className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold text-slate-700 hover:text-cancha">Ver ligas <ArrowRight size={16} /></Link>
          </section>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700"><Newspaper size={18} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Historias del fútbol</p><h2 className="text-base font-black text-slate-900">Noticias</h2></div></div>
            <p className="mt-4 text-sm leading-6 text-slate-500">La sección editorial aparecerá aquí cuando conectes el CMS y publiques artículos.</p>
            <Link href="/noticias" className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold text-slate-700 hover:text-cancha">Ir a noticias <ArrowRight size={16} /></Link>
          </section>
        </aside>
      </div>
      <section className="mt-10 flex flex-col justify-between gap-4 rounded-2xl bg-emerald-50/70 p-5 sm:flex-row sm:items-center sm:px-7">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cancha">Cancha está en construcción</p><p className="mt-1 text-sm text-slate-600">Empezamos por los marcadores; pronto, más fútbol.</p></div>
        <Link href="/resultados" className="inline-flex items-center gap-2 text-sm font-extrabold text-cancha">Explorar calendario <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
