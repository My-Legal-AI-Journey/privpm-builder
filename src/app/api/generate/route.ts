import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePrivPM } from "@/lib/generate";
import { normalizeInputBrief } from "@/lib/normalize";

const bodySchema = z
  .object({
    brief: z.string().optional(),
    feature: z.string().optional(),
    purpose: z.string().optional(),
    knownIssues: z.string().optional(),
    jurisdiction: z.enum(["CN", "EU", "CN+EU"]),
  })
  .transform((v) => {
    const brief =
      v.brief?.trim() ||
      [v.feature, v.purpose && `目的：${v.purpose}`, v.knownIssues && `已知问题：${v.knownIssues}`]
        .filter(Boolean)
        .join("\n");
    return { brief: normalizeInputBrief(brief || ""), jurisdiction: v.jurisdiction };
  })
  .refine((v) => v.brief.length > 0, { message: "brief_required" });

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
