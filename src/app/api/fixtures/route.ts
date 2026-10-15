import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getFixtures } from "../../../lib/football/service";

const querySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().startsWith(value)) });

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({ date: request.nextUrl.searchParams.get("date") });
  if (!parsed.success) return NextResponse.json({ error: "Parámetro date inválido; usa YYYY-MM-DD." }, { status: 400 });
  const result = await getFixtures(parsed.data.date);
  if (!result.ok) {
    const status = result.code === "not_configured" ? 503 : result.code === "rate_limit" ? 429 : 502;
    return NextResponse.json({ error: result.message }, { status });
  }
  return NextResponse.json({ date: parsed.data.date, fixtures: result.fixtures }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
