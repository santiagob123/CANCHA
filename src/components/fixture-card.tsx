import type { Fixture } from "../lib/football/types";
import { Clock3 } from "lucide-react";
import Image from "next/image";

function statusLabel(fixture: Fixture) {
  if (fixture.status === "live") return fixture.elapsed ? `${fixture.elapsed}’` : "En vivo";
  if (fixture.status === "halftime") return "Descanso";
  if (fixture.status === "finished") return "Finalizado";
  if (fixture.status === "postponed") return "Aplazado";
  if (fixture.status === "cancelled") return "Cancelado";
  if (fixture.status === "unknown") return fixture.statusText;
  return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: process.env.APP_TIME_ZONE || "America/Bogota" }).format(new Date(fixture.kickoff));
}

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const isPlayed = fixture.status === "live" || fixture.status === "halftime" || fixture.status === "finished";
  return (
    <article className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-slate-100 px-5 py-4 first:border-0">
      <div className="min-w-0 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {fixture.status === "live" && <span className="size-1.5 animate-pulse rounded-full bg-rose-500" />}
          {statusLabel(fixture)}
        </div>
        {[fixture.home, fixture.away].map((team, index) => (
          <div key={team.id} className="flex min-w-0 items-center gap-3">
            {team.logo ? <Image src={team.logo} alt="" width={24} height={24} className="size-6 object-contain" /> : <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500">{team.name.slice(0, 1)}</span>}
            <span className="truncate text-sm font-semibold text-slate-800">{team.name}</span>
            <span className="sr-only">{index === 0 ? "local" : "visitante"}</span>
          </div>
        ))}
      </div>
      <div className="space-y-3 text-right text-base font-black tabular-nums text-slate-950">
        <div>{isPlayed ? fixture.home.goals ?? "–" : <Clock3 className="ml-auto text-slate-300" size={16} />}</div>
        <div>{isPlayed ? fixture.away.goals ?? "–" : <span className="text-xs font-medium text-slate-400">vs</span>}</div>
      </div>
    </article>
  );
}
