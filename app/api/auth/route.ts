import { NextRequest, NextResponse } from "next/server";
import { getFidFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  const userFid = await getFidFromRequest(request);
  if (userFid === null) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  return NextResponse.json({ userFid });
}
