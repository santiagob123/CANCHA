import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { z } from "zod";
import { FixtureCard } from "../../components/fixture-card";
import { getFixtures, groupByLeague } from "../../lib/football/service";
import Image from "next/image";

export const metadata: Metadata = { title: "Resultados", description: "Consulta partidos y resultados de fútbol por fecha." };
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().startsWith(value));
type Props = { searchParams: Promise<{ date?: string }> };

function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function todayDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: process.env.APP_TIME_ZONE || "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default async function ResultsPage({ searchParams }: Props) {
  const params = await searchParams;
  const candidate = params.date && dateSchema.safeParse(params.date).success ? params.date : todayDate();
  const result = await getFixtures(candidate);
  const groups = result.ok ? groupByLeague(result.fixtures) : [];
  const label = new Intl.DateTimeFormat("es-CO", { dateStyle: "full", timeZone: process.env.APP_TIME_ZONE || "America/Bogota" }).format(new Date(`${candidate}T12:00:00Z`));

  return <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-10 lg:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-cancha">Marcadores y calendario</p>
    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Resultados</h1>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <Link href={`/resultados?date=${shiftDate(candidate, -1)}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"><ChevronLeft size={17} /> Día anterior</Link>
      <p className="text-sm font-bold capitalize text-slate-800">{label}</p>
      <Link href={`/resultados?date=${shiftDate(candidate, 1)}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Día siguiente <ChevronRight size={17} /></Link>
    </div>
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-live="polite">
      {groups.length ? groups.map((group) => <div key={group.league.id}>
        <div className="flex items-center gap-2 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600">{group.league.logo && <Image src={group.league.logo} alt="" width={18} height={18} className="size-[18px] object-contain" />}{group.league.name}{group.league.country && <span className="font-medium text-slate-400">· {group.league.country}</span>}</div>
        {group.fixtures.map((fixture) => <FixtureCard key={fixture.id} fixture={fixture} />)}
      </div>) : <div className="px-6 py-14 text-center"><h2 className="font-bold text-slate-800">{result.ok ? "No hay partidos para esta fecha" : "No se pudieron cargar los resultados"}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{result.ok ? "Prueba con un día cercano usando los controles de fecha." : result.message}</p></div>}
    </section>
  </main>;
}
