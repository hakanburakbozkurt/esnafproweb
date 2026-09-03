/**
 * Temporary diagnostic — servis onay lookup debug.
 * Usage: node scripts/debug-servis-onay-lookup.mjs
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const TARGETS = [
  "apr-1788430013111-ox2y5gbqds",
  "SRV-2026-005",
];

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  "Content-Type": "application/json",
};

async function restGet(path) {
  const response = await fetch(`${url}${path}`, { headers });
  const text = await response.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch {
    // keep raw text
  }
  return { status: response.status, data, error: response.ok ? null : data };
}

async function rpcLookup(token) {
  const response = await fetch(`${url}/rest/v1/rpc/get_technical_service_public`, {
    method: "POST",
    headers,
    body: JSON.stringify({ p_token: token, p_service_id: token }),
  });
  const text = await response.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch {
    // keep raw text
  }
  return {
    label: `rpc.get_technical_service_public(token=${token})`,
    status: response.status,
    data,
    error: response.ok ? null : data,
  };
}

async function directEq(column, value) {
  const encoded = encodeURIComponent(`${column}.eq.${value}`);
  const result = await restGet(
    `/rest/v1/technical_service?select=id,service_id,approval_token,approval_status,customer_name,device_info,tracking_code,created_at&${encoded}`
  );
  return {
    label: `direct.technical_service.${column}=${value}`,
    ...result,
  };
}

async function directIlike(pattern) {
  const encoded = encodeURIComponent(`approval_token.ilike.${pattern}`);
  const result = await restGet(
    `/rest/v1/technical_service?select=id,service_id,approval_token,approval_status,customer_name,device_info,tracking_code,created_at&${encoded}`
  );
  return {
    label: `direct.technical_service.approval_token ILIKE ${pattern}`,
    ...result,
  };
}

function printResult({ label, status, data, error }) {
  console.log("\n" + "=".repeat(72));
  console.log(label);
  console.log("-".repeat(72));
  console.log("httpStatus:", status);
  console.log("error:", error ? JSON.stringify(error, null, 2) : null);
  console.log("data:", JSON.stringify(data, null, 2));
}

console.log("Supabase URL:", url);
console.log("Anon client diagnostic (REST, same as browser/server RPC path)");
console.log("Targets:", TARGETS.join(", "));

for (const target of TARGETS) {
  printResult(await rpcLookup(target));
  printResult(await directEq("service_id", target));
  printResult(await directEq("approval_token", target));
  printResult(await directIlike(`%${target.replace(/^apr-/, "")}%`));
}

console.log("\nDone.\n");
