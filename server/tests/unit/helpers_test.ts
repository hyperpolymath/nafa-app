// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * Unit Tests - Domain Helper Functions
 *
 * Tests core business logic for sensory classification, validation, and transformation.
 */

import { assertEquals, assert } from "@std/assert";

// Helper functions (copied from domain logic)
function sensoryLevelDescription(level: number): string {
  if (level <= 2) return "Very Low";
  if (level <= 4) return "Low";
  if (level <= 6) return "Moderate";
  if (level <= 8) return "High";
  return "Very High";
}

function isValidSensoryLevel(level: number): boolean {
  return typeof level === "number" && level >= 0 && level <= 10 && Number.isInteger(level);
}

function validateSensoryProfile(profile: unknown): boolean {
  if (typeof profile !== "object" || profile === null) return false;
  const p = profile as Record<string, unknown>;
  return (
    isValidSensoryLevel(p.noise as number) &&
    isValidSensoryLevel(p.light as number) &&
    isValidSensoryLevel(p.crowd as number)
  );
}

function exceedsProfile(levels: Record<string, number>, profile: Record<string, number>): boolean {
  return levels.noise > profile.noise || levels.light > profile.light || levels.crowd > profile.crowd;
}

// Test Suite

Deno.test("sensoryLevelDescription: Very Low (0-2)", () => {
  assertEquals(sensoryLevelDescription(0), "Very Low");
  assertEquals(sensoryLevelDescription(1), "Very Low");
  assertEquals(sensoryLevelDescription(2), "Very Low");
});

Deno.test("sensoryLevelDescription: Low (3-4)", () => {
  assertEquals(sensoryLevelDescription(3), "Low");
  assertEquals(sensoryLevelDescription(4), "Low");
});

Deno.test("sensoryLevelDescription: Moderate (5-6)", () => {
  assertEquals(sensoryLevelDescription(5), "Moderate");
  assertEquals(sensoryLevelDescription(6), "Moderate");
});

Deno.test("sensoryLevelDescription: High (7-8)", () => {
  assertEquals(sensoryLevelDescription(7), "High");
  assertEquals(sensoryLevelDescription(8), "High");
});

Deno.test("sensoryLevelDescription: Very High (9-10)", () => {
  assertEquals(sensoryLevelDescription(9), "Very High");
  assertEquals(sensoryLevelDescription(10), "Very High");
});

Deno.test("isValidSensoryLevel: accepts 0-10 integers", () => {
  assert(isValidSensoryLevel(0));
  assert(isValidSensoryLevel(5));
  assert(isValidSensoryLevel(10));
});

Deno.test("isValidSensoryLevel: rejects negative numbers", () => {
  assert(!isValidSensoryLevel(-1));
});

Deno.test("isValidSensoryLevel: rejects >10", () => {
  assert(!isValidSensoryLevel(11));
});

Deno.test("isValidSensoryLevel: rejects non-integers", () => {
  assert(!isValidSensoryLevel(5.5));
});

Deno.test("isValidSensoryLevel: rejects non-numbers", () => {
  assert(!isValidSensoryLevel("5" as unknown as number));
});

Deno.test("validateSensoryProfile: accepts valid profile", () => {
  const profile = { noise: 5, light: 6, crowd: 4 };
  assert(validateSensoryProfile(profile));
});

Deno.test("validateSensoryProfile: rejects null", () => {
  assert(!validateSensoryProfile(null));
});

Deno.test("validateSensoryProfile: rejects profile with invalid noise", () => {
  assert(!validateSensoryProfile({ noise: 11, light: 5, crowd: 5 }));
});

Deno.test("validateSensoryProfile: rejects profile with negative light", () => {
  assert(!validateSensoryProfile({ noise: 5, light: -1, crowd: 5 }));
});

Deno.test("exceedsProfile: returns true when levels exceed profile", () => {
  const levels = { noise: 7, light: 6, crowd: 5 };
  const profile = { noise: 6, light: 5, crowd: 5 };
  assert(exceedsProfile(levels, profile));
});

Deno.test("exceedsProfile: returns false when levels within profile", () => {
  const levels = { noise: 5, light: 4, crowd: 3 };
  const profile = { noise: 6, light: 5, crowd: 5 };
  assert(!exceedsProfile(levels, profile));
});

Deno.test("exceedsProfile: returns false when levels equal profile", () => {
  const levels = { noise: 5, light: 5, crowd: 5 };
  const profile = { noise: 5, light: 5, crowd: 5 };
  assert(!exceedsProfile(levels, profile));
});

Deno.test("exceedsProfile: returns true when any dimension exceeds", () => {
  const levels = { noise: 4, light: 4, crowd: 6 };
  const profile = { noise: 5, light: 5, crowd: 5 };
  assert(exceedsProfile(levels, profile));
});
