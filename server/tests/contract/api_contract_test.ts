// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * Contract Tests - API Schema Consistency
 *
 * Validates that all API responses conform to expected JSON schemas
 * and maintain consistent structure across requests.
 */

import { assertEquals, assert, assertExists } from "@std/assert";

const BASE_URL = "http://localhost:8080";

// Schema validators
function isValidId(value: unknown): boolean {
  return typeof value === "string" && value.length > 0;
}

function isValidTimestamp(value: unknown): boolean {
  return typeof value === "number" && value > 0;
}

function isValidSensoryProfile(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.noise === "number" &&
    typeof p.light === "number" &&
    typeof p.crowd === "number" &&
    p.noise >= 0 &&
    p.noise <= 10 &&
    p.light >= 0 &&
    p.light <= 10 &&
    p.crowd >= 0 &&
    p.crowd <= 10
  );
}

function validateHealthResponse(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  const response = data as Record<string, unknown>;
  return response.status === "ok";
}

function validateAnnotation(annotation: unknown): boolean {
  if (typeof annotation !== "object" || annotation === null) return false;
  const ann = annotation as Record<string, unknown>;
  return (
    isValidId(ann.id) &&
    isValidId(ann.locationId) &&
    isValidId(ann.locationName) &&
    typeof ann.noise === "number" &&
    typeof ann.light === "number" &&
    typeof ann.crowd === "number" &&
    isValidTimestamp(ann.timestamp)
  );
}

function validateJourney(journey: unknown): boolean {
  if (typeof journey !== "object" || journey === null) return false;
  const j = journey as Record<string, unknown>;
  return (
    isValidId(j.id) &&
    typeof j.title === "string" &&
    Array.isArray(j.segments) &&
    typeof j.estimatedMinutes === "number"
  );
}

// Test contract compliance

Deno.test({
  name: "Contract: Health response has correct schema",
  ignore: true, // Server must be running
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    assert(validateHealthResponse(data));
    assertEquals(Object.keys(data).length, 1); // Only 'status' field
  },
});

Deno.test({
  name: "Contract: Journey list returns array of journeys",
  ignore: true,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/journeys`);
    const data = await response.json();
    assert(Array.isArray(data));
    for (const journey of data) {
      assert(validateJourney(journey));
    }
  },
});

Deno.test({
  name: "Contract: Single journey response is valid",
  ignore: true,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/journeys/journey-001`);
    const data = await response.json();
    assert(validateJourney(data));
    assertExists(data.id);
    assertExists(data.title);
  },
});

Deno.test({
  name: "Contract: Annotation POST response includes all fields",
  ignore: true,
  fn: async () => {
    const annotation = {
      locationId: "test-loc",
      locationName: "Test Location",
      noise: 5,
      light: 6,
      crowd: 4,
      notes: "Test",
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    const data = await response.json();
    assert(validateAnnotation(data));
    // Verify all submitted fields are in response
    assertEquals(data.locationId, annotation.locationId);
    assertEquals(data.locationName, annotation.locationName);
    assertEquals(data.noise, annotation.noise);
  },
});

Deno.test({
  name: "Contract: Error responses have consistent format",
  ignore: true,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/journeys/non-existent`);
    const data = await response.json();
    // Error responses should have 'error' field
    assert(typeof data.error === "string");
  },
});

Deno.test({
  name: "Contract: All responses have Content-Type application/json",
  ignore: true,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    assertEquals(response.headers.get("Content-Type"), "application/json");
  },
});

Deno.test({
  name: "Contract: Journey object always has required fields",
  ignore: true,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/journeys`);
    const journeys = await response.json();
    for (const journey of journeys) {
      assertExists(journey.id);
      assertExists(journey.title);
      assertExists(journey.segments);
      assertExists(journey.estimatedMinutes);
      assert(Array.isArray(journey.segments));
    }
  },
});

Deno.test({
  name: "Contract: Sensory profile values always 0-10",
  ignore: true,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/journeys`);
    const journeys = await response.json();
    for (const journey of journeys) {
      for (const segment of journey.segments) {
        if (segment.sensoryLevels) {
          assert(isValidSensoryProfile(segment.sensoryLevels));
        }
      }
    }
  },
});

Deno.test({
  name: "Contract: Annotation list responses maintain structure",
  ignore: true,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/annotations/city-center-station`);
    const annotations = await response.json();
    assert(Array.isArray(annotations));
    for (const annotation of annotations) {
      if (annotation.locationId === "city-center-station") {
        assert(validateAnnotation(annotation));
      }
    }
  },
});

Deno.test({
  name: "Contract: No unexpected fields in health response",
  ignore: true,
  fn: async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    const allowedFields = ["status"];
    for (const key of Object.keys(data)) {
      assert(allowedFields.includes(key), `Unexpected field: ${key}`);
    }
  },
});
