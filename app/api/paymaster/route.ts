import { NextRequest, NextResponse } from "next/server";

type JsonRpcRequest = {
  jsonrpc: string;
  method: string;
  params?: unknown[];
  id?: number | string | null;
};

const PAYMASTER_METHOD_PREFIX = "pm_";
const JSON_CONTENT_TYPE = "application/json";

function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as JsonRpcRequest).jsonrpc === "string" &&
    typeof (value as JsonRpcRequest).method === "string"
  );
}

function isAllowedRequest(payload: unknown): boolean {
  if (Array.isArray(payload)) {
    return payload.length > 0 && payload.every(isAllowedRequest);
  }

  if (!isJsonRpcRequest(payload)) {
    return false;
  }

  return payload.method.startsWith(PAYMASTER_METHOD_PREFIX);
}

function getPaymasterEndpoint(): string | null {
  const endpoint = process.env.CDP_PAYMASTER_URL?.trim() || null;

  if (!endpoint || !/^https?:\/\//i.test(endpoint)) {
    return null;
  }

  return endpoint;
}

export async function POST(request: NextRequest) {
  const endpoint = getPaymasterEndpoint();
  if (!endpoint) {
    return NextResponse.json(
      {
        error:
          "Paymaster proxy is not configured. Set CDP_PAYMASTER_URL on the server.",
      },
      { status: 500 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Expected a JSON-RPC payload." },
      { status: 400 },
    );
  }

  if (!isAllowedRequest(payload)) {
    return NextResponse.json(
      { error: "Only paymaster JSON-RPC methods (pm_*) are allowed." },
      { status: 403 },
    );
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": JSON_CONTENT_TYPE,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach upstream paymaster endpoint." },
      { status: 502 },
    );
  }

  const responseText = await upstreamResponse.text();

  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: {
      "content-type":
        upstreamResponse.headers.get("content-type") || JSON_CONTENT_TYPE,
    },
  });
}
