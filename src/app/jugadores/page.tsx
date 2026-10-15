import type { Metadata } from "next";
import { SectionState } from "../../components/section-state";

export const metadata: Metadata = { title: "Jugadores", description: "Consulta información de jugadores de fútbol." };
export default function PlayersPage() { return <SectionState section="jugadores" title="Jugadores" description="Los perfiles y estadísticas se añadirán en una fase posterior, según la cobertura disponible en la API." />; }
