import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePrivPM } from "@/lib/generate";

const bodySchema = z.object({
  feature: z.string().min(1),
  purpose: z.string().min(1),
  jurisdiction: z.enum(["CN", "EU", "CN+EU"]),
  knownIssues: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
    }
    const output = await generatePrivPM(parsed.data);
    return NextResponse.json(output);
  } catch (e) {
    return NextResponse.json({ error: "generate_failed", message: String(e) }, { status: 500 });
  }
}
