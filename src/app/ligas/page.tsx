import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCompetitions } from "../../lib/football/service";

export const metadata: Metadata = { title: "Ligas", description: "Explora ligas y competiciones de fútbol disponibles." };
type Props = { searchParams: Promise<{ q?: string }> };

export default async function LeaguesPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 80);
  const result = await getCompetitions();
  const competitions = result.ok ? result.data.filter((league) => !query || `${league.name} ${league.country.name} ${league.type}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())) : [];
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
    <p className="text-sm font-semibold uppercase tracking-[.18em] text-emerald-700">Cancha · Competiciones</p>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-bold tracking-tight">Ligas y torneos</h1><p className="mt-2 text-slate-600">Competiciones vigentes registradas por API-Football.</p></div><span className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">{result.ok ? `${competitions.length} resultados` : "Catálogo no disponible"}</span></div>
    <form className="mt-8 flex max-w-xl gap-2" action="/ligas"><label className="sr-only" htmlFor="competition-search">Buscar liga o país</label><input id="competition-search" name="q" defaultValue={query} maxLength={80} placeholder="Busca por competición o país" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-600"/><button className="rounded-xl bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800">Buscar</button></form>
    {!result.ok ? <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-semibold">{result.code === "not_configured" ? "Falta configurar la API" : result.code === "rate_limit" ? "Límite temporal alcanzado" : "No se pudo cargar el catálogo"}</h2><p className="mt-2 text-sm text-slate-700">{result.message}</p></section> : competitions.length === 0 ? <p className="mt-8 rounded-2xl bg-white p-8 text-slate-600">{query ? "No hay competiciones que coincidan con la búsqueda." : "La fuente no devolvió competiciones vigentes."}</p> : <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{competitions.map((league) => <Link key={league.id} href={`/ligas/${league.id}`} className="group flex min-h-36 items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"><div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-50">{league.logo ? <Image src={league.logo} alt="" fill sizes="64px" className="object-contain p-2"/> : <span className="text-xl font-bold text-emerald-800">{league.name.slice(0,1)}</span>}</div><div className="min-w-0"><h2 className="truncate text-lg font-semibold group-hover:text-emerald-800">{league.name}</h2><p className="mt-1 truncate text-sm text-slate-500">{league.country.name} · {league.type}</p><p className="mt-2 text-xs text-slate-500">Temporada {league.seasons.find((season) => season.current)?.year ?? league.seasons[0]?.year ?? "sin temporada indicada"}</p></div></Link>)}</div>}
  </main>;
}
