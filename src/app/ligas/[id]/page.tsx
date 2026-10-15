import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompetition, getLeagueFixtures, getLeagueTeams, getStandings } from "../../../lib/football/service";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ season?: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id)) return { title: "Competición" };
  const result = await getCompetition(Number(id));
  return { title: result.ok && result.data ? result.data.name : "Competición", description: "Temporadas, clasificación y partidos de la competición." };
}

function Empty({ children }: { children: React.ReactNode }) { return <p className="rounded-xl bg-white p-5 text-sm text-slate-600">{children}</p>; }
function ErrorBox({ message }: { message: string }) { return <p className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-slate-700">{message}</p>; }
function MatchList({ matches }: { matches: Awaited<ReturnType<typeof getLeagueFixtures>> }) {
  if (!matches.ok) return <ErrorBox message={matches.message}/>;
  if (!matches.data.length) return <Empty>La fuente no devolvió partidos para esta temporada.</Empty>;
  return <div className="divide-y divide-slate-100 rounded-xl bg-white">{matches.data.map((match) => <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 text-sm"><span className="truncate text-right">{match.home.name}</span><span className="whitespace-nowrap rounded-lg bg-slate-50 px-3 py-2 font-semibold tabular-nums">{match.home.goals ?? "–"} : {match.away.goals ?? "–"}</span><span className="truncate">{match.away.name}</span></div>)}</div>;
}

export default async function CompetitionPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!/^\d{1,10}$/.test(id)) notFound();
  const leagueId = Number(id);
  if (!Number.isSafeInteger(leagueId) || leagueId < 1) notFound();
  const result = await getCompetition(leagueId);
  if (result.ok && !result.data) notFound();
  if (!result.ok) return <main className="mx-auto max-w-5xl px-5 py-12"><Link href="/ligas" className="text-sm text-emerald-800">← Volver a ligas</Link><h1 className="mt-5 text-3xl font-bold">No se pudo cargar la competición</h1><div className="mt-5"><ErrorBox message={result.message}/></div></main>;
  const league = result.data!;
  const requested = query.season && /^\d{4}$/.test(query.season) ? Number(query.season) : undefined;
  const season = league.seasons.find((item) => item.year === requested) ?? league.seasons.find((item) => item.current) ?? league.seasons[0];
  const invalidSeason = requested !== undefined && !league.seasons.some((item) => item.year === requested);
  const [standings, upcoming, recent, teams] = season ? await Promise.all([
    season.standingsAvailable ? getStandings(league.id, season.year) : Promise.resolve(null),
    getLeagueFixtures(league.id, season.year, "next"), getLeagueFixtures(league.id, season.year, "last"), getLeagueTeams(league.id, season.year),
  ]) : [null, null, null, null];
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <Link href="/ligas" className="text-sm font-medium text-emerald-800 hover:underline">← Todas las competiciones</Link>
    <header className="mt-6 flex flex-wrap items-center gap-5 rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-50">{league.logo ? <Image src={league.logo} alt="" fill sizes="80px" className="object-contain p-2"/> : <span className="text-3xl font-bold text-emerald-800">{league.name.slice(0,1)}</span>}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">{league.country.name} · {league.type}</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{league.name}</h1><p className="mt-2 text-sm text-slate-500">ID de API-Football: {league.id}</p></div><form action={`/ligas/${league.id}`}><label htmlFor="season" className="mb-1 block text-xs font-semibold uppercase text-slate-500">Temporada</label><select id="season" name="season" defaultValue={season?.year ?? ""} className="rounded-xl border border-slate-200 bg-white px-4 py-3" disabled={!league.seasons.length}>{league.seasons.map((item) => <option key={item.year} value={item.year}>{item.year}{item.current ? " · actual" : ""}</option>)}</select><button className="ml-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white">Ver</button></form></header>
    {invalidSeason && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-slate-700">La temporada solicitada no está declarada por la fuente; se muestra la temporada disponible más reciente.</p>}
    {!season ? <section className="mt-8"><h2 className="text-xl font-bold">Temporadas</h2><div className="mt-3"><Empty>API-Football no declaró temporadas para esta competición.</Empty></div></section> : <>
      <section className="mt-8"><h2 className="mb-3 text-xl font-bold">Clasificación · {season.year}</h2>{!season.standingsAvailable ? <Empty>La fuente indica que esta temporada no incluye cobertura de clasificación.</Empty> : !standings ? null : !standings.ok ? <ErrorBox message={standings.message}/> : standings.data.length === 0 ? <Empty>No hay clasificación disponible para esta temporada.</Empty> : <div className="space-y-5">{standings.data.map((group, index) => <div key={`${group.name ?? "group"}-${index}`}><h3 className="mb-2 font-semibold text-slate-700">{group.name ?? "Tabla general"}</h3><div className="overflow-x-auto rounded-xl bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-100 text-xs uppercase text-slate-500"><tr><th className="p-3">#</th><th className="p-3">Equipo</th><th className="p-3">PJ</th><th className="p-3">G</th><th className="p-3">E</th><th className="p-3">P</th><th className="p-3">DG</th><th className="p-3">Pts</th></tr></thead><tbody className="divide-y divide-slate-100">{group.rows.map((row) => <tr key={row.team.id}><td className="p-3 font-semibold">{row.rank}</td><td className="p-3 font-medium">{row.team.name}</td><td className="p-3">{row.played ?? "–"}</td><td className="p-3">{row.wins ?? "–"}</td><td className="p-3">{row.draws ?? "–"}</td><td className="p-3">{row.losses ?? "–"}</td><td className="p-3">{row.goalsDiff ?? "–"}</td><td className="p-3 font-bold">{row.points ?? "–"}</td></tr>)}</tbody></table></div></div>)}</div>}</section>
      <div className="mt-8 grid gap-8 lg:grid-cols-2"><section><h2 className="mb-3 text-xl font-bold">Próximos partidos</h2><MatchList matches={upcoming!}/></section><section><h2 className="mb-3 text-xl font-bold">Últimos resultados</h2><MatchList matches={recent!}/></section></div>
      <section className="mt-8"><h2 className="mb-3 text-xl font-bold">Equipos participantes</h2>{!teams!.ok ? <ErrorBox message={teams!.message}/> : teams!.data.length === 0 ? <Empty>La fuente no devolvió equipos para esta temporada.</Empty> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{teams!.data.map((team) => <article key={team.id} className="flex items-center gap-3 rounded-xl bg-white p-4">{team.logo && <Image src={team.logo} alt="" width={36} height={36} className="size-9 object-contain"/>}<div><h3 className="font-semibold">{team.name}</h3><p className="text-xs text-slate-500">{[team.country, team.venue, team.city].filter(Boolean).join(" · ") || "Participante"}</p></div></article>)}</div>}</section>
    </>}
  </main>;
}
