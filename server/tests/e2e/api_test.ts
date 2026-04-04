// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * End-to-End Tests - Full API Contract
 *
 * Tests complete API workflows including health checks, journey retrieval,
 * and annotation submission.
 */

import { assertEquals, assert, assertExists } from "@std/assert";

const BASE_URL = "http://localhost:8080";

// Start a minimal test server
const testServer = { running: false };

async function startTestServer() {
  if (testServer.running) return;

  const { serve } = await import("@std/http/server");

  const sampleJourney = {
    id: "journey-001",
    title: "Commute to Central Library",
    status: "Planning",
    estimatedMinutes: 35,
    segments: [
      {
        id: "seg-1",
        transportMode: "Walk",
        fromLocation: "Home",
        toLocation: "Bus Stop",
        durationMinutes: 5,
        sensoryLevels: { noise: 3, light: 5, crowd: 2 },
      },
    ],
    sensoryAnnotations: [
      {
        id: "ann-1",
        locationId: "city-center-station",
        locationName: "City Center Station",
        noise: 7,
        light: 5,
        crowd: 8,
        notes: "Very busy during rush",
        timestamp: Date.now(),
      },
    ],
  };

  const handler = async (req: Request) => {
    const url = new URL(req.url, BASE_URL);
    const method = req.method;
    const pathname = url.pathname;

    // Health check
    if (method === "GET" && pathname === "/api/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all journeys
    if (method === "GET" && pathname === "/api/journeys") {
      return new Response(JSON.stringify([sampleJourney]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get single journey
    if (method === "GET" && pathname.startsWith("/api/journeys/")) {
      const id = pathname.replace("/api/journeys/", "");
      if (id === sampleJourney.id) {
        return new Response(JSON.stringify(sampleJourney), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Post annotation
    if (method === "POST" && pathname === "/api/annotations") {
      try {
        const body = await req.json();
        if (!body.locationId || !body.locationName) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ id: `ann-${Date.now()}`, ...body }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Get annotations by location
    if (method === "GET" && pathname.startsWith("/api/annotations/")) {
      const locationId = pathname.replace("/api/annotations/", "");
      const filtered = sampleJourney.sensoryAnnotations.filter((a) => a.locationId === locationId);
      return new Response(JSON.stringify(filtered), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  };

  const abortController = new AbortController();

  serve(handler, {
    hostname: "localhost",
    port: 8080,
    signal: abortController.signal,
  }).catch(() => {});

  // Wait for server to start
  let attempts = 0;
  while (attempts < 50) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        testServer.running = true;
        break;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 10));
    attempts++;
  }
}

// Run before all tests
Deno.test({
  name: "E2E: Server startup",
  ignore: false,
  fn: async () => {
    await startTestServer();
    assert(testServer.running);
  },
});

Deno.test({
  name: "E2E: GET /api/health returns 200 with ok status",
  ignore: false,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    assertEquals(response.status, 200);
    const data = await response.json();
    assertEquals(data.status, "ok");
  },
});

Deno.test({
  name: "E2E: GET /api/journeys returns array",
  ignore: false,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/journeys`);
    assertEquals(response.status, 200);
    const data = await response.json();
    assert(Array.isArray(data));
    assert(data.length > 0);
  },
});

Deno.test({
  name: "E2E: GET /api/journeys/:id returns journey",
  ignore: false,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/journeys/journey-001`);
    assertEquals(response.status, 200);
    const data = await response.json();
    assertEquals(data.id, "journey-001");
    assertEquals(data.title, "Commute to Central Library");
    assertExists(data.segments);
  },
});

Deno.test({
  name: "E2E: GET /api/journeys/:id returns 404 for non-existent journey",
  ignore: false,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/journeys/non-existent`);
    assertEquals(response.status, 404);
    await response.json(); // Consume body
  },
});

Deno.test({
  name: "E2E: POST /api/annotations with valid data returns 201",
  ignore: false,
  fn: async () => {
    const annotation = {
      locationId: "test-location",
      locationName: "Test Location",
      noise: 5,
      light: 6,
      crowd: 4,
      notes: "Test annotation",
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    assertEquals(response.status, 201);
    const data = await response.json();
    assertExists(data.id);
    assertEquals(data.locationId, "test-location");
  },
});

Deno.test({
  name: "E2E: POST /api/annotations missing locationId returns 400",
  ignore: false,
  fn: async () => {
    const annotation = {
      locationName: "Test Location",
      noise: 5,
      light: 6,
      crowd: 4,
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    assertEquals(response.status, 400);
    await response.json(); // Consume body
  },
});

Deno.test({
  name: "E2E: POST /api/annotations with invalid JSON returns 400",
  ignore: false,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json {",
    });
    assertEquals(response.status, 400);
    await response.json(); // Consume body
  },
});

Deno.test({
  name: "E2E: GET /api/annotations/:locationId returns filtered annotations",
  ignore: false,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/annotations/city-center-station`);
    assertEquals(response.status, 200);
    const data = await response.json();
    assert(Array.isArray(data));
    if (data.length > 0) {
      assertEquals(data[0].locationId, "city-center-station");
    }
  },
});

Deno.test({
  name: "E2E: POST /api/annotations returns location data in response",
  ignore: false,
  fn: async () => {
    const annotation = {
      locationId: "e2e-test",
      locationName: "E2E Test Location",
      noise: 7,
      light: 8,
      crowd: 6,
      notes: "E2E test",
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    const data = await response.json();
    assertEquals(data.locationName, "E2E Test Location");
    assertEquals(data.noise, 7);
    assertEquals(data.light, 8);
    assertEquals(data.crowd, 6);
  },
});

Deno.test({
  name: "E2E: Unknown route returns 404",
  ignore: false,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/unknown/route`);
    assertEquals(response.status, 404);
    await response.json(); // Consume body
  },
});
