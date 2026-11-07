import { NextRequest, NextResponse } from "next/server";
import { getCleanroomBusinesses } from "@/lib/cleanroomData";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const state = searchParams.get("state");
  const sub_region = searchParams.get("sub_region");
  const sub_sub_region = searchParams.get("sub_sub_region");
  const att_filter = searchParams.get("att_filter") as "ALL" | "ATT_ONLY" | "NON_ATT_ONLY" | null;
  const size_tiers = searchParams.get("size_tiers");
  const q = searchParams.get("q");

  const businesses = getCleanroomBusinesses({
    state,
    sub_region,
    sub_sub_region,
    att_filter,
    size_tiers,
    q,
  });

  return NextResponse.json({
    status: "ok",
    count: businesses.length,
    businesses,
    provenance: {
      poi_source: "Overture Maps Foundation (CDLA-Permissive-2.0)",
      bandwidth_modeling: "Statutory Non-CPNI Outside-In Firmographic Estimate",
      fcc_broadband: "FCC BDC Public Summary (H3-Res8)",
      privacy: "CCPA/CPRA Pre-Masked Lead Records",
    },
  });
}

