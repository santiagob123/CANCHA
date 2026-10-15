export type MatchStatus = "scheduled" | "live" | "halftime" | "finished" | "postponed" | "cancelled" | "unknown";

export type Fixture = {
  id: number;
  kickoff: string;
  status: MatchStatus;
  statusText: string;
  elapsed: number | null;
  league: { id: number; name: string; country: string; logo: string | null };
  home: { id: number; name: string; logo: string | null; goals: number | null };
  away: { id: number; name: string; logo: string | null; goals: number | null };
};

export type FixtureGroup = { league: Fixture["league"]; fixtures: Fixture[] };

export type CompetitionSeason = {
  year: number;
  start: string | null;
  end: string | null;
  current: boolean;
  standingsAvailable: boolean;
};

export type Competition = {
  id: number;
  name: string;
  type: string;
  logo: string | null;
  country: { name: string; code: string | null; flag: string | null };
  seasons: CompetitionSeason[];
};

export type StandingRow = {
  rank: number;
  team: { id: number; name: string; logo: string | null };
  points: number | null;
  goalsDiff: number | null;
  group: string | null;
  form: string | null;
  status: string | null;
  description: string | null;
  played: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
};

export type StandingGroup = { name: string | null; rows: StandingRow[] };

export type LeagueTeam = {
  id: number;
  name: string;
  country: string | null;
  founded: number | null;
  national: boolean | null;
  logo: string | null;
  venue: string | null;
  city: string | null;
};

export type FootballResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: "not_configured" | "rate_limit" | "provider_error"; message: string };

export type FixturesResult =
  | { ok: true; fixtures: Fixture[] }
  | { ok: false; code: "not_configured" | "rate_limit" | "provider_error"; message: string };
