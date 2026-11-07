import { NextRequest, NextResponse } from "next/server";
import { generateAuditReceipt } from "@/lib/cleanroomData";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gersId = params.id;
  if (!gersId) {
    return NextResponse.json(
      { detail: "Missing required overture_gers_id parameter" },
      { status: 400 }
    );
  }

  const receipt = generateAuditReceipt(gersId);
  if (!receipt) {
    return NextResponse.json(
      { detail: `Entity with overture_gers_id '${gersId}' not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json(receipt);
}

