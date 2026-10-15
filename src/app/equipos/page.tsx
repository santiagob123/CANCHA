import type { Metadata } from "next";
import { SectionState } from "../../components/section-state";

export const metadata: Metadata = { title: "Equipos", description: "Consulta equipos de fútbol." };
export default function TeamsPage() { return <SectionState section="equipos" title="Equipos" description="El catálogo y la búsqueda de equipos se habilitarán cuando integremos sus datos reales del proveedor." />; }
