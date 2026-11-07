import { NextResponse } from "next/server";
import { getCleanroomHierarchy } from "@/lib/cleanroomData";

export async function GET() {
  const hierarchy = getCleanroomHierarchy();
  return NextResponse.json({
    status: "ok",
    hierarchy,
    total_states: hierarchy.length,
    legal_license: "CDLA-Permissive-2.0 (Overture Maps Foundation)",
  });
}

