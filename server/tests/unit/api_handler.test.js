// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
//
// In-process tests of the NAFA API handler (server/src/main.js) with bun test.

import { describe, expect, test } from "bun:test";
import { handleRequest } from "../../src/main.js";

const call = (path, init) =>
  handleRequest(new Request(`http://localhost${path}`, init));

const postAnnotation = (body) =>
  call("/api/annotations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

describe("NAFA API handler", () => {
  test("GET /api/health returns ok", async () => {
    const res = await call("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  test("GET /api/journeys lists journey-001 with segments", async () => {
    const res = await call("/api/journeys");
    expect(res.status).toBe(200);
    const journeys = await res.json();
    expect(Array.isArray(journeys)).toBe(true);
    expect(journeys[0].id).toBe("journey-001");
    expect(journeys[0].segments.length).toBeGreaterThan(0);
    expect(journeys[0].segments[0].sensoryLevels).toBeDefined();
  });

  test("GET /api/journeys/journey-001 returns the journey", async () => {
    const res = await call("/api/journeys/journey-001");
    expect(res.status).toBe(200);
    const journey = await res.json();
    expect(journey.title).toBe("Commute to Central Library");
    expect(journey.status).toBe("Planning");
  });

  test("GET unknown journey returns 404", async () => {
    const res = await call("/api/journeys/nonexistent-999");
    expect(res.status).toBe(404);
  });

  test("POST /api/annotations accepts a valid annotation", async () => {
    const res = await postAnnotation(
      JSON.stringify({
        locationId: "test-loc",
        locationName: "Test Location",
        noise: 3,
        light: 4,
        crowd: 2,
      }),
    );
    expect(res.status).toBe(201);
    const ann = await res.json();
    expect(ann.id).toStartWith("ann-");
    expect(ann.locationId).toBe("test-loc");
  });

  test("POST /api/annotations with missing fields returns 400", async () => {
    const res = await postAnnotation(JSON.stringify({ noise: 3 }));
    expect(res.status).toBe(400);
  });

  test("POST /api/annotations with invalid JSON returns 400", async () => {
    const res = await postAnnotation("{not json");
    expect(res.status).toBe(400);
  });

  test("GET /api/annotations/<location> filters by location", async () => {
    const res = await call("/api/annotations/city-center-station");
    expect(res.status).toBe(200);
    const anns = await res.json();
    expect(anns.length).toBe(1);
    expect(anns[0].locationName).toBe("City Center Station");
  });

  test("unknown route returns 404", async () => {
    const res = await call("/api/nope");
    expect(res.status).toBe(404);
  });
});
