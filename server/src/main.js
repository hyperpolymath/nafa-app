// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2025 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * NAFA MVP Backend — Minimal API Service.
 *
 * This server provides the data layer for the "Neuro-Atypical Friendly App".
 * It serves journey planning data and sensory annotations used by the
 * ReScript frontend to visualize cognitive load and environmental intensity.
 */

const PORT = 8080;

// DOMAIN MODEL: Sample Journey Data.
// Represents a multi-segment commute with associated sensory metrics (Noise, Light, Crowds).
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
      // SENSORY SCORING: Used to alert the user of potential over-stimulation.
      sensoryLevels: { noise: 3, light: 5, crowd: 2 },
    },
    {
      id: "seg-2",
      transportMode: "Bus",
      fromLocation: "Bus Stop",
      toLocation: "City Center",
      durationMinutes: 15,
      sensoryWarning: "Expect moderate crowding during peak hours.",
      sensoryLevels: { noise: 6, light: 4, crowd: 7 },
    }
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

// Route handler for all API endpoints
async function handleRequest(req) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
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
    const journeys = [sampleJourney];
    return new Response(JSON.stringify(journeys), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get single journey by ID
  if (method === "GET" && pathname.startsWith("/api/journeys/")) {
    const id = pathname.replace("/api/journeys/", "");
    if (id === sampleJourney.id) {
      return new Response(JSON.stringify(sampleJourney), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Journey not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Post new annotation
  if (method === "POST" && pathname === "/api/annotations") {
    try {
      const body = await req.json();
      // Validate required fields
      if (!body.locationId || !body.locationName) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      // Return accepted annotation with ID
      const annotation = {
        id: `ann-${Date.now()}`,
        ...body,
        timestamp: Date.now(),
      };
      return new Response(JSON.stringify(annotation), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Get annotations by location
  if (method === "GET" && pathname.startsWith("/api/annotations/")) {
    const locationId = pathname.replace("/api/annotations/", "");
    const annotations = sampleJourney.sensoryAnnotations || [];
    const filtered = annotations.filter((a) => a.locationId === locationId);
    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Not found
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

// Start server using Deno's built-in HTTP server
console.log(`🚀 NAFA Server starting on http://localhost:${PORT}`);
Deno.serve({ hostname: "localhost", port: PORT }, handleRequest);
