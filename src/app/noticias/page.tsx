import type { Metadata } from "next";
import { SectionState } from "../../components/section-state";

export const metadata: Metadata = { title: "Noticias", description: "Actualidad de fútbol publicada por Cancha." };
export default function NewsPage() { return <SectionState section="noticias" title="Noticias" description="El CMS todavía no está conectado y no hay artículos publicados. Cuando configuremos Sanity, aquí aparecerá contenido editorial real." />; }
