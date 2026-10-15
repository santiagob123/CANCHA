import { apiFootballProvider } from "./api-football";
import type { Competition, Fixture, FixtureGroup, FixturesResult, FootballResult, LeagueTeam, StandingGroup } from "./types";

type DataMethod = () => Promise<unknown>;
async function asResult<T>(method: DataMethod): Promise<FootballResult<T>> {
  try { return { ok: true, data: await method() as T }; }
  catch (error) {
    if (error instanceof Error && error.message === "API_FOOTBALL_NOT_CONFIGURED") return { ok: false, code: "not_configured", message: "Añade API_FOOTBALL_KEY en .env.local para consultar competiciones reales." };
    if (error instanceof Error && error.message === "FOOTBALL_RATE_LIMIT") return { ok: false, code: "rate_limit", message: "La fuente deportiva alcanzó su límite de solicitudes. Inténtalo más tarde." };
    console.error("Football catalog request failed", error instanceof Error ? error.message : "Unknown error");
    return { ok: false, code: "provider_error", message: "No se pudieron cargar los datos deportivos. Inténtalo de nuevo más tarde." };
  }
}

export const getCompetitions = () => asResult<Competition[]>(() => apiFootballProvider.getCompetitions());
export const getCompetition = (id: number) => asResult<Competition | null>(() => apiFootballProvider.getCompetition(id));
export const getStandings = (league: number, season: number) => asResult<StandingGroup[]>(() => apiFootballProvider.getStandings(league, season));
export const getLeagueFixtures = (league: number, season: number, direction: "next" | "last") => asResult<Fixture[]>(() => apiFootballProvider.getLeagueFixtures(league, season, direction, process.env.APP_TIME_ZONE || "America/Bogota"));
export const getLeagueTeams = (league: number, season: number) => asResult<LeagueTeam[]>(() => apiFootballProvider.getLeagueTeams(league, season));

export async function getFixtures(date: string): Promise<FixturesResult> {
  try {
    const timezone = process.env.APP_TIME_ZONE || "America/Bogota";
    const fixtures = await apiFootballProvider.getFixturesByDate(date, timezone);
    return { ok: true, fixtures };
  } catch (error) {
    if (error instanceof Error && error.message === "API_FOOTBALL_NOT_CONFIGURED") {
      return { ok: false, code: "not_configured", message: "Añade API_FOOTBALL_KEY en .env.local para consultar datos deportivos reales." };
    }
    if (error instanceof Error && error.message === "FOOTBALL_RATE_LIMIT") {
      return { ok: false, code: "rate_limit", message: "La fuente deportiva alcanzó su límite de solicitudes. Inténtalo más tarde." };
    }
    console.error("Football data request failed", error instanceof Error ? error.message : "Unknown error");
    return { ok: false, code: "provider_error", message: "No se pudieron cargar los partidos. Inténtalo de nuevo más tarde." };
  }
}

export function groupByLeague(fixtures: Fixture[]): FixtureGroup[] {
  const groups = new Map<number, FixtureGroup>();
  for (const fixture of fixtures) {
    const group = groups.get(fixture.league.id) ?? { league: fixture.league, fixtures: [] };
    group.fixtures.push(fixture);
    groups.set(fixture.league.id, group);
  }
  return [...groups.values()];
}
