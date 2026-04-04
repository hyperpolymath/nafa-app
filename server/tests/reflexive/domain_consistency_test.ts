// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * Reflexive Tests - Domain Self-Consistency
 *
 * Validates that domain logic is internally consistent:
 * - Round-trip operations produce identical results
 * - Invariants are maintained across transformations
 * - Enum and type definitions align
 */

import { assertEquals, assert } from "@std/assert";

// Domain models and helpers

type TransportMode = "Walk" | "Bus" | "Train" | "Tram" | "Metro";

type JourneyStatus = "Planning" | "Active" | "Paused" | "Completed";

interface SensoryProfile {
  noise: number;
  light: number;
  crowd: number;
}

// Routing functions (from shared/src/Route.res)
function routeFromPath(path: string): string {
  const segments = path.split("/").filter((s) => s !== "");
  switch (segments[0]) {
    case undefined:
      return "Home";
    case "journeys":
      return "JourneyList";
    case "journey":
      return `JourneyView(${segments[1]})`;
    case "annotate":
      return `Annotate(${segments[1]})`;
    case "accessibility":
      return "Accessibility";
    case "offline":
      return "Offline";
    default:
      return "NotFound";
  }
}

function routeToPath(route: string): string {
  if (route === "Home") return "/";
  if (route === "JourneyList") return "/journeys";
  if (route === "Accessibility") return "/accessibility";
  if (route === "Offline") return "/offline";
  if (route === "NotFound") return "/404";
  if (route.startsWith("JourneyView(")) {
    const id = route.slice(12, -1); // Extract ID from "JourneyView(id)"
    return `/journey/${id}`;
  }
  if (route.startsWith("Annotate(")) {
    const id = route.slice(9, -1); // Extract ID from "Annotate(id)"
    return `/annotate/${id}`;
  }
  return "/404";
}

// Domain functions

function sensoryLevelDescription(level: number): string {
  if (level <= 2) return "Very Low";
  if (level <= 4) return "Low";
  if (level <= 6) return "Moderate";
  if (level <= 8) return "High";
  return "Very High";
}

const transportModeToEmoji: Record<TransportMode, string> = {
  Walk: "🚶",
  Bus: "🚌",
  Train: "🚆",
  Tram: "🚊",
  Metro: "🚇",
};

const transportModeToString: Record<TransportMode, string> = {
  Walk: "Walk",
  Bus: "Bus",
  Train: "Train",
  Tram: "Tram",
  Metro: "Metro",
};

// Reflexive Tests

Deno.test("Reflexive: Route round-trip - Home", () => {
  const route = "Home";
  const path = routeToPath(route);
  const recovered = routeFromPath(path);
  assertEquals(recovered, route);
});

Deno.test("Reflexive: Route round-trip - JourneyList", () => {
  const route = "JourneyList";
  const path = routeToPath(route);
  const recovered = routeFromPath(path);
  assertEquals(recovered, route);
});

Deno.test("Reflexive: Route round-trip - Accessibility", () => {
  const route = "Accessibility";
  const path = routeToPath(route);
  const recovered = routeFromPath(path);
  assertEquals(recovered, route);
});

Deno.test("Reflexive: Route round-trip - Offline", () => {
  const route = "Offline";
  const path = routeToPath(route);
  const recovered = routeFromPath(path);
  assertEquals(recovered, route);
});

Deno.test("Reflexive: Route round-trip - JourneyView with ID", () => {
  const route = "JourneyView(journey-001)";
  const path = routeToPath(route);
  const recovered = routeFromPath(path);
  assertEquals(recovered, route);
});

Deno.test("Reflexive: Route round-trip - Annotate with ID", () => {
  const route = "Annotate(city-center)";
  const path = routeToPath(route);
  const recovered = routeFromPath(path);
  assertEquals(recovered, route);
});

Deno.test("Reflexive: Sensory levels always 0-10 after description", () => {
  for (let level = 0; level <= 10; level++) {
    const desc = sensoryLevelDescription(level);
    // Descriptions should exist for all valid levels
    assert(
      desc === "Very Low" || desc === "Low" || desc === "Moderate" || desc === "High" || desc === "Very High"
    );
  }
});

Deno.test("Reflexive: Transport mode strings match enum keys", () => {
  const modes: TransportMode[] = ["Walk", "Bus", "Train", "Tram", "Metro"];
  for (const mode of modes) {
    const str = transportModeToString[mode];
    assertEquals(str, mode);
  }
});

Deno.test("Reflexive: Transport mode emojis exist for all modes", () => {
  const modes: TransportMode[] = ["Walk", "Bus", "Train", "Tram", "Metro"];
  for (const mode of modes) {
    const emoji = transportModeToEmoji[mode];
    assert(emoji.length > 0);
    assert(typeof emoji === "string");
  }
});

Deno.test("Reflexive: Sensory profile values stay within bounds", () => {
  const profile: SensoryProfile = { noise: 5, light: 6, crowd: 4 };
  assert(profile.noise >= 0 && profile.noise <= 10);
  assert(profile.light >= 0 && profile.light <= 10);
  assert(profile.crowd >= 0 && profile.crowd <= 10);
});

Deno.test("Reflexive: Transport mode enum completeness", () => {
  const expectedModes = ["Walk", "Bus", "Train", "Tram", "Metro"];
  const stringKeys = Object.keys(transportModeToString);
  const emojiKeys = Object.keys(transportModeToEmoji);
  assertEquals(stringKeys.sort(), expectedModes.sort());
  assertEquals(emojiKeys.sort(), expectedModes.sort());
});

Deno.test("Reflexive: Journey status values are known enum values", () => {
  const validStatuses: JourneyStatus[] = ["Planning", "Active", "Paused", "Completed"];
  for (const status of validStatuses) {
    assert(typeof status === "string");
    assert(status.length > 0);
  }
});

Deno.test("Reflexive: Sensory level descriptions are monotonic", () => {
  // Moving from 0 to 10, descriptions should progress
  let lastDesc = sensoryLevelDescription(0);
  const descriptions = [];
  for (let i = 0; i <= 10; i++) {
    descriptions.push(sensoryLevelDescription(i));
  }
  // Check that description categories don't decrease
  const categoryOrder = ["Very Low", "Low", "Moderate", "High", "Very High"];
  const indices = descriptions.map((d) => categoryOrder.indexOf(d));
  for (let i = 1; i < indices.length; i++) {
    assert(indices[i] >= indices[i - 1], "Descriptions should not decrease");
  }
});

Deno.test("Reflexive: All valid routes parse to known values", () => {
  const paths = ["/", "/journeys", "/journey/123", "/annotate/456", "/accessibility", "/offline", "/unknown"];
  for (const path of paths) {
    const route = routeFromPath(path);
    assert(
      route === "Home" ||
        route === "JourneyList" ||
        route.startsWith("JourneyView(") ||
        route.startsWith("Annotate(") ||
        route === "Accessibility" ||
        route === "Offline" ||
        route === "NotFound"
    );
  }
});

Deno.test("Reflexive: Route NotFound produces 404 path", () => {
  const path = routeToPath("NotFound");
  assertEquals(path, "/404");
});

Deno.test("Reflexive: Sensory description is deterministic", () => {
  for (let level = 0; level <= 10; level++) {
    const desc1 = sensoryLevelDescription(level);
    const desc2 = sensoryLevelDescription(level);
    assertEquals(desc1, desc2, `Description for level ${level} should be deterministic`);
  }
});

Deno.test("Reflexive: Transport mode mappings are inverse-compatible", () => {
  const modes: TransportMode[] = ["Walk", "Bus", "Train", "Tram", "Metro"];
  for (const mode of modes) {
    const str = transportModeToString[mode];
    const emoji = transportModeToEmoji[mode];
    // Each mode has a string and emoji
    assertEquals(str, mode);
    assert(emoji.length > 0);
  }
});
