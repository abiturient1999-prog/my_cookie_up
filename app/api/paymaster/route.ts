import { NextRequest, NextResponse } from "next/server";

type JsonRpcRequest = {
  jsonrpc: string;
  method: string;
  params?: unknown[];
  id?: number | string | null;
};

const PAYMASTER_METHOD_PREFIX = "pm_";
const JSON_CONTENT_TYPE = "application/json";
const EXECUTE_SELECTOR = "0xb61d27f6";
const EXECUTE_BATCH_SELECTOR = "0x47e1da2a";

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

function parseExecuteTarget(callData: string): {
  selector: string;
  target: string | null;
  value: string | null;
} {
  const selector = callData.slice(0, 10).toLowerCase();
  const data = callData.startsWith("0x") ? callData.slice(2) : callData;

  if (selector === EXECUTE_SELECTOR && data.length >= 8 + 64 * 2) {
    const firstWord = data.slice(8, 8 + 64);
    const secondWord = data.slice(8 + 64, 8 + 64 * 2);
    const target = `0x${firstWord.slice(24)}`;
    const value = `0x${secondWord.replace(/^0+/, "") || "0"}`;
    return { selector, target, value };
  }

  if (selector === EXECUTE_BATCH_SELECTOR) {
    return { selector, target: "executeBatch", value: null };
  }

  return { selector, target: null, value: null };
}

function getUserOperationCallData(payload: unknown): string[] {
  const rpcItems = Array.isArray(payload) ? payload : [payload];
  const callDataList: string[] = [];

  for (const item of rpcItems) {
    if (!isJsonRpcRequest(item)) {
      continue;
    }

    const firstParam = item.params?.[0];
    if (
      firstParam &&
      typeof firstParam === "object" &&
      typeof (firstParam as { callData?: unknown }).callData === "string"
    ) {
      callDataList.push((firstParam as { callData: string }).callData);
    }
  }

  return callDataList;
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

  const debugEnabled = process.env.PAYMASTER_PROXY_DEBUG === "1";
  const debugParsedCalls = debugEnabled
    ? getUserOperationCallData(payload).map(parseExecuteTarget)
    : [];

  if (debugEnabled) {
    for (const parsed of debugParsedCalls) {
      console.log("[paymaster-proxy] selector:", parsed.selector);
      console.log("[paymaster-proxy] target:", parsed.target);
      console.log("[paymaster-proxy] value:", parsed.value);
    }
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

  const responseHeaders = new Headers({
    "content-type":
      upstreamResponse.headers.get("content-type") || JSON_CONTENT_TYPE,
  });

  if (debugEnabled && debugParsedCalls.length > 0) {
    const first = debugParsedCalls[0];
    responseHeaders.set("x-paymaster-debug-selector", first.selector);
    responseHeaders.set("x-paymaster-debug-target", first.target ?? "null");
    responseHeaders.set("x-paymaster-debug-value", first.value ?? "null");
  }

  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
