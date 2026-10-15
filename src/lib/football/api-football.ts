import { z } from "zod";
import type { FootballProvider } from "./provider";
import type { Competition, Fixture, LeagueTeam, MatchStatus, StandingGroup } from "./types";

const nullableString = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();
const fixtureSchema = z.object({
  fixture: z.object({ id: z.number(), date: z.string(), status: z.object({ short: z.string(), long: z.string(), elapsed: nullableNumber }) }),
  league: z.object({ id: z.number(), name: z.string(), country: z.string(), logo: nullableString }),
  teams: z.object({ home: z.object({ id: z.number(), name: z.string(), logo: nullableString }), away: z.object({ id: z.number(), name: z.string(), logo: nullableString }) }),
  goals: z.object({ home: nullableNumber, away: nullableNumber }),
});
const responseSchema = z.object({ response: z.array(z.unknown()), errors: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional() });
const apiSeasonSchema = z.object({ year: z.number(), start: nullableString, end: nullableString, current: z.boolean().optional(), coverage: z.object({ standings: z.boolean().optional() }).optional() });
const competitionSchema = z.object({
  league: z.object({ id: z.number(), name: z.string(), type: z.string().optional(), logo: nullableString }),
  country: z.object({ name: z.string().optional(), code: nullableString, flag: nullableString }).optional(),
  seasons: z.array(apiSeasonSchema).optional(),
});

function normalizeStatus(code: string): MatchStatus {
  if (["1H", "2H", "ET", "P", "BT", "LIVE"].includes(code)) return "live";
  if (code === "HT") return "halftime";
  if (["FT", "AET", "PEN"].includes(code)) return "finished";
  if (["PST", "SUSP", "INT"].includes(code)) return "postponed";
  if (["CANC", "ABD", "AWD", "WO"].includes(code)) return "cancelled";
  return code === "NS" ? "scheduled" : "unknown";
}

function normalizeFixture(item: unknown): Fixture {
  const result = fixtureSchema.parse(item);
  return {
    id: result.fixture.id, kickoff: result.fixture.date, status: normalizeStatus(result.fixture.status.short),
    statusText: result.fixture.status.long, elapsed: result.fixture.status.elapsed ?? null,
    league: { ...result.league, logo: result.league.logo ?? null },
    home: { ...result.teams.home, logo: result.teams.home.logo ?? null, goals: result.goals.home ?? null },
    away: { ...result.teams.away, logo: result.teams.away.logo ?? null, goals: result.goals.away ?? null },
  };
}

function normalizeCompetition(item: unknown): Competition {
  const parsed = competitionSchema.parse(item);
  return {
    id: parsed.league.id, name: parsed.league.name, type: parsed.league.type ?? "Competición",
    logo: parsed.league.logo ?? null,
    country: { name: parsed.country?.name ?? "Internacional", code: parsed.country?.code ?? null, flag: parsed.country?.flag ?? null },
    seasons: (parsed.seasons ?? []).map((season) => ({ year: season.year, start: season.start ?? null, end: season.end ?? null, current: season.current ?? false, standingsAvailable: season.coverage?.standings ?? false })).sort((a, b) => b.year - a.year),
  };
}

async function request(path: string, params: Record<string, string>, revalidate: number): Promise<unknown[]> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error("API_FOOTBALL_NOT_CONFIGURED");
  const url = new URL(`https://v3.football.api-sports.io/${path}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  const response = await fetch(url, { headers: { "x-apisports-key": key, Accept: "application/json" }, next: { revalidate } });
  if (response.status === 429) throw new Error("FOOTBALL_RATE_LIMIT");
  if (!response.ok) throw new Error("FOOTBALL_PROVIDER_ERROR");
  const parsed = responseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("FOOTBALL_INVALID_RESPONSE");
  const errors = parsed.data.errors;
  if (errors && (Array.isArray(errors) ? errors.length > 0 : Object.keys(errors).length > 0)) {
    const message = Array.isArray(errors) ? errors.join(" ") : Object.values(errors).join(" ");
    if (/rate|limit|too many/i.test(String(message))) throw new Error("FOOTBALL_RATE_LIMIT");
    throw new Error("FOOTBALL_PROVIDER_ERROR");
  }
  return parsed.data.response;
}

function normalizeStandings(item: unknown): StandingGroup[] {
  const league = z.object({ standings: z.array(z.array(z.unknown())) }).parse(z.object({ league: z.unknown() }).parse(item).league);
  return league.standings.map((rows) => {
    const normalized = rows.map((row) => {
      const value = z.object({
        rank: z.number(), team: z.object({ id: z.number(), name: z.string(), logo: nullableString }), points: nullableNumber, goalsDiff: nullableNumber,
        group: nullableString, form: nullableString, status: nullableString, description: nullableString,
        all: z.object({ played: nullableNumber, win: nullableNumber, draw: nullableNumber, lose: nullableNumber, goals: z.object({ for: nullableNumber, against: nullableNumber }) }).optional(),
      }).parse(row);
      return { rank: value.rank, team: { ...value.team, logo: value.team.logo ?? null }, points: value.points ?? null, goalsDiff: value.goalsDiff ?? null, group: value.group ?? null, form: value.form ?? null, status: value.status ?? null, description: value.description ?? null, played: value.all?.played ?? null, wins: value.all?.win ?? null, draws: value.all?.draw ?? null, losses: value.all?.lose ?? null, goalsFor: value.all?.goals.for ?? null, goalsAgainst: value.all?.goals.against ?? null };
    });
    return { name: normalized[0]?.group ?? null, rows: normalized };
  });
}

export const apiFootballProvider: FootballProvider = {
  async getFixturesByDate(date, timezone) {
    return (await request("fixtures", { date, timezone }, 60)).map(normalizeFixture);
  },
  async getCompetitions() {
    return (await request("leagues", { current: "true" }, 21600)).map(normalizeCompetition);
  },
  async getCompetition(id) {
    const items = await request("leagues", { id: String(id) }, 86400);
    return items[0] ? normalizeCompetition(items[0]) : null;
  },
  async getStandings(leagueId, season) {
    const items = await request("standings", { league: String(leagueId), season: String(season) }, 3600);
    return items[0] ? normalizeStandings(items[0]) : [];
  },
  async getLeagueFixtures(leagueId, season, direction, timezone) {
    return (await request("fixtures", { league: String(leagueId), season: String(season), [direction]: "5", timezone }, 3600)).map(normalizeFixture);
  },
  async getLeagueTeams(leagueId, season) {
    const items = await request("teams", { league: String(leagueId), season: String(season) }, 86400);
    return items.map((item) => {
      const value = z.object({ team: z.object({ id: z.number(), name: z.string(), country: nullableString, founded: nullableNumber, national: z.boolean().nullable().optional(), logo: nullableString }), venue: z.object({ name: nullableString, city: nullableString }).nullable().optional() }).parse(item);
      return { id: value.team.id, name: value.team.name, country: value.team.country ?? null, founded: value.team.founded ?? null, national: value.team.national ?? null, logo: value.team.logo ?? null, venue: value.venue?.name ?? null, city: value.venue?.city ?? null } satisfies LeagueTeam;
    });
  },
};
