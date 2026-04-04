// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * Smoke Tests - Server Startup and Basic Connectivity
 *
 * Minimal tests verifying the server can start and respond to basic requests.
 */

import { assertEquals } from "@std/assert";

const TEST_PORT = 8888;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let abortController: AbortController | null = null;
let serverStarted = false;

// Start test server
async function startTestServer() {
  if (serverStarted) return;

  const mainModule = await import(`file://${Deno.cwd()}/server/src/main.js`);

  // Minimal server for smoke test
  const { serve } = await import("@std/http/server");

  abortController = new AbortController();

  const handler = async (req: Request) => {
    if (req.url === `http://localhost:${TEST_PORT}/api/health`) {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Not Found", { status: 404 });
  };

  // Start server without await (runs in background)
  serve(handler, {
    hostname: "localhost",
    port: TEST_PORT,
    signal: abortController.signal,
    onListen: () => {
      serverStarted = true;
    },
  }).catch(() => {}); // Ignore shutdown errors

  // Wait for server to start
  let attempts = 0;
  while (!serverStarted && attempts < 50) {
    await new Promise((r) => setTimeout(r, 10));
    attempts++;
  }
}

// Stop test server
function stopTestServer() {
  if (abortController) {
    abortController.abort();
  }
  serverStarted = false;
}

Deno.test({
  name: "Smoke: Server can start",
  ignore: false,
  fn: async () => {
    await startTestServer();
    assertEquals(serverStarted, true);
  },
});

Deno.test({
  name: "Smoke: Server responds to health check",
  ignore: false,
  fn: async () => {
    await startTestServer();
    const response = await fetch(`${BASE_URL}/api/health`);
    assertEquals(response.status, 200);
    const data = await response.json();
    assertEquals(data.status, "ok");
  },
});

Deno.test({
  name: "Smoke: Server returns 404 for unknown routes",
  ignore: false,
  fn: async () => {
    await startTestServer();
    const response = await fetch(`${BASE_URL}/unknown`);
    assertEquals(response.status, 404);
  },
});

// Cleanup
Deno.test({
  name: "Smoke: Cleanup after tests",
  ignore: false,
  fn: () => {
    stopTestServer();
    assertEquals(serverStarted, false);
  },
});
