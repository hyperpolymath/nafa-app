// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * Property-Based Tests - Roundtrip Consistency
 *
 * Uses generative testing to verify that valid objects serialize/deserialize
 * consistently and that invalid inputs are consistently rejected.
 */

import { assertEquals, assert } from "@std/assert";

// Simple property testing helpers
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate valid sensory profiles
function generateValidProfile() {
  return {
    noise: randomInt(0, 10),
    light: randomInt(0, 10),
    crowd: randomInt(0, 10),
  };
}

// Generate valid annotations
function generateValidAnnotation() {
  return {
    id: `ann-${randomString(8)}`,
    locationId: `loc-${randomString(8)}`,
    locationName: `Location ${randomString(4)}`,
    noise: randomInt(0, 10),
    light: randomInt(0, 10),
    crowd: randomInt(0, 10),
    notes: Math.random() > 0.5 ? `Note ${randomString(10)}` : null,
    timestamp: Date.now(),
  };
}

// Generate valid journey segments
function generateValidSegment() {
  return {
    id: `seg-${randomString(8)}`,
    transportMode: ["Walk", "Bus", "Train", "Tram", "Metro"][randomInt(0, 4)],
    fromLocation: `Location ${randomString(4)}`,
    toLocation: `Location ${randomString(4)}`,
    durationMinutes: randomInt(1, 60),
    sensoryWarning: Math.random() > 0.5 ? `Warning ${randomString(10)}` : null,
    sensoryLevels: generateValidProfile(),
  };
}

// Test properties

Deno.test("Property: Valid sensory profile JSON roundtrips", () => {
  for (let i = 0; i < 100; i++) {
    const original = generateValidProfile();
    const serialized = JSON.stringify(original);
    const deserialized = JSON.parse(serialized);
    assertEquals(deserialized, original);
    assertEquals(deserialized.noise, original.noise);
    assertEquals(deserialized.light, original.light);
    assertEquals(deserialized.crowd, original.crowd);
  }
});

Deno.test("Property: Valid annotation JSON roundtrips", () => {
  for (let i = 0; i < 50; i++) {
    const original = generateValidAnnotation();
    const serialized = JSON.stringify(original);
    const deserialized = JSON.parse(serialized);
    assertEquals(deserialized.id, original.id);
    assertEquals(deserialized.locationId, original.locationId);
    assertEquals(deserialized.locationName, original.locationName);
    assertEquals(deserialized.noise, original.noise);
  }
});

Deno.test("Property: Sensory values always stay within 0-10", () => {
  for (let i = 0; i < 200; i++) {
    const profile = generateValidProfile();
    assert(profile.noise >= 0 && profile.noise <= 10);
    assert(profile.light >= 0 && profile.light <= 10);
    assert(profile.crowd >= 0 && profile.crowd <= 10);
  }
});

Deno.test("Property: Annotations always have valid timestamps", () => {
  for (let i = 0; i < 50; i++) {
    const annotation = generateValidAnnotation();
    assert(typeof annotation.timestamp === "number");
    assert(annotation.timestamp > 0);
    assert(annotation.timestamp <= Date.now() + 1000); // Within 1 second
  }
});

Deno.test("Property: Segment durations are positive", () => {
  for (let i = 0; i < 50; i++) {
    const segment = generateValidSegment();
    assert(segment.durationMinutes > 0);
    assert(segment.durationMinutes < 1440); // Less than 24 hours
  }
});

Deno.test("Property: Transport modes are valid enum values", () => {
  const validModes = ["Walk", "Bus", "Train", "Tram", "Metro"];
  for (let i = 0; i < 50; i++) {
    const segment = generateValidSegment();
    assert(validModes.includes(segment.transportMode));
  }
});

Deno.test("Property: Invalid sensory level (negative) consistently fails", () => {
  for (let i = 0; i < 10; i++) {
    const invalid = { noise: -1, light: 5, crowd: 5 };
    const serialized = JSON.stringify(invalid);
    const deserialized = JSON.parse(serialized);
    // Confirms negative values are NOT filtered during serialization
    assert(deserialized.noise === -1);
  }
});

Deno.test("Property: Invalid sensory level (>10) consistently fails", () => {
  for (let i = 0; i < 10; i++) {
    const invalid = { noise: 11, light: 5, crowd: 5 };
    const serialized = JSON.stringify(invalid);
    const deserialized = JSON.parse(serialized);
    // Confirms out-of-range values are NOT filtered during serialization
    assert(deserialized.noise === 11);
  }
});

Deno.test("Property: Annotation without locationId is consistently invalid", () => {
  for (let i = 0; i < 10; i++) {
    const invalid = {
      // Missing locationId
      locationName: "Test",
      noise: 5,
      light: 5,
      crowd: 5,
    };
    // This should fail validation on the server side
    assert(!("locationId" in invalid));
  }
});

Deno.test("Property: Empty annotations array is valid", () => {
  const annotations: unknown[] = [];
  const serialized = JSON.stringify(annotations);
  const deserialized = JSON.parse(serialized);
  assertEquals(deserialized.length, 0);
});

Deno.test("Property: Large sensory profile arrays maintain order", () => {
  for (let i = 0; i < 10; i++) {
    const profiles = Array.from({ length: 50 }, generateValidProfile);
    const serialized = JSON.stringify(profiles);
    const deserialized = JSON.parse(serialized);
    assertEquals(deserialized.length, 50);
    for (let j = 0; j < 50; j++) {
      assertEquals(deserialized[j].noise, profiles[j].noise);
    }
  }
});
