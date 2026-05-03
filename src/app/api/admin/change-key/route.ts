import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthorized, setAdminKey } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const newKey = String(body?.newKey ?? "").trim();
    if (newKey.length < 8) {
      return NextResponse.json(
        { error: "המפתח חייב להיות לפחות 8 תווים" },
        { status: 400 },
      );
    }
    if (newKey.length > 200) {
      return NextResponse.json({ error: "המפתח ארוך מדי" }, { status: 400 });
    }
    await setAdminKey(newKey);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("change-key error", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
