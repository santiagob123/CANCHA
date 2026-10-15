import type { Competition, Fixture, LeagueTeam, StandingGroup } from "./types";

export interface FootballProvider {
  getFixturesByDate(date: string, timezone: string): Promise<Fixture[]>;
  getCompetitions(): Promise<Competition[]>;
  getCompetition(id: number): Promise<Competition | null>;
  getStandings(leagueId: number, season: number): Promise<StandingGroup[]>;
  getLeagueFixtures(leagueId: number, season: number, direction: "next" | "last", timezone: string): Promise<Fixture[]>;
  getLeagueTeams(leagueId: number, season: number): Promise<LeagueTeam[]>;
}
