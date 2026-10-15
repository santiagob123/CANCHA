import type { Metadata } from "next";
import { SectionState } from "../../components/section-state";

export const metadata: Metadata = { title: "Buscar", description: "Busca equipos y competiciones de fútbol." };
export default function SearchPage() { return <SectionState section="buscar" title="Buscar en Cancha" description="La búsqueda de equipos y competiciones se habilitará junto con esos catálogos. Por ahora, consulta los resultados por fecha." />; }
