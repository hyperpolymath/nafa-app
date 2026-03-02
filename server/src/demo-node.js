#!/usr/bin/env node
// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2025 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * NAFA MVP CLI Demo (Node.js compatible)
 *
 * Runs the full journey + annotation flow in the terminal
 * to demonstrate the MVP functionality without needing a browser.
 *
 * Run with: node server/src/demo-node.js
 */

// Domain helpers (matching ReScript types)
const sensoryLevelDescription = (level) => {
  if (level <= 2) return "Very Low";
  if (level <= 4) return "Low";
  if (level <= 6) return "Moderate";
  if (level <= 8) return "High";
  return "Very High";
};

const transportModeEmoji = {
  Walk: "🚶",
  Bus: "🚌",
  Train: "🚆",
  Tram: "🚊",
  Metro: "🚇",
};

const renderSensoryLevel = (label, level) => {
  const filled = "█".repeat(level);
  const empty = "░".repeat(10 - level);
  return `${label}: ${filled}${empty} (${level}/10 - ${sensoryLevelDescription(level)})`;
};

// Sample journey data
const journey = {
  id: "journey-001",
  title: "Morning Commute to Central Library",
  status: "Planning",
  estimatedMinutes: 35,
  segments: [
    {
      id: "seg-1",
      transportMode: "Walk",
      fromLocation: "Home",
      toLocation: "Oak Street Bus Stop",
      durationMinutes: 5,
      sensoryWarning: null,
      sensoryLevels: { noise: 3, light: 5, crowd: 2 },
    },
    {
      id: "seg-2",
      transportMode: "Bus",
      fromLocation: "Oak Street Bus Stop",
      toLocation: "City Center Station",
      durationMinutes: 15,
      sensoryWarning: "Rush hour: expect moderate crowding",
      sensoryLevels: { noise: 6, light: 4, crowd: 7 },
    },
    {
      id: "seg-3",
      transportMode: "Walk",
      fromLocation: "City Center Station",
      toLocation: "Central Library",
      durationMinutes: 8,
      sensoryWarning: "Construction noise on Main Street",
      sensoryLevels: { noise: 8, light: 6, crowd: 5 },
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
      notes: "Very busy during morning rush, quieter after 9am",
      timestamp: Date.now(),
    },
  ],
};

// Demo flow
console.log(`
╔══════════════════════════════════════════════════════════════╗
║              NAFA MVP DEMO - Journey + Annotations           ║
║     Neurodiverse App for Adventurers                         ║
╚══════════════════════════════════════════════════════════════╝

This demo shows the two core MVP features:
  1. Journey Plan View - with sensory-aware route segments
  2. Sensory Annotation Flow - crowdsourced location data

═══════════════════════════════════════════════════════════════

`);

// Wait function for pacing
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDemo() {
  // Step 1: Show Journey Plan
  console.log("📍 STEP 1: Journey Plan View\n");
  console.log("════════════════════════════════════════");
  console.log(`🗺️  JOURNEY: ${journey.title}`);
  console.log("════════════════════════════════════════");
  console.log(`Status: 📋 ${journey.status}`);
  console.log(`Estimated Time: ${journey.estimatedMinutes} minutes\n`);
  console.log("ROUTE SEGMENTS:\n");

  for (const segment of journey.segments) {
    const emoji = transportModeEmoji[segment.transportMode];
    console.log(`  ${emoji} ${segment.transportMode}`);
    console.log("  ────────────────────────────────────");
    console.log(`  From: ${segment.fromLocation}`);
    console.log(`  To:   ${segment.toLocation}`);
    console.log(`  Duration: ${segment.durationMinutes} minutes`);

    if (segment.sensoryWarning) {
      console.log(`    ⚠️  ${segment.sensoryWarning}`);
    }

    if (segment.sensoryLevels) {
      console.log("    Sensory Levels:");
      console.log(`      ${renderSensoryLevel("Noise", segment.sensoryLevels.noise)}`);
      console.log(`      ${renderSensoryLevel("Light", segment.sensoryLevels.light)}`);
      console.log(`      ${renderSensoryLevel("Crowd", segment.sensoryLevels.crowd)}`);
    }
    console.log("");
  }

  await wait(300);

  // Step 2: Show existing annotations
  console.log("\n📝 SENSORY ANNOTATIONS (Community Contributed)");
  console.log("════════════════════════════════════════\n");

  for (const ann of journey.sensoryAnnotations) {
    console.log(`  📍 ${ann.locationName}`);
    console.log(`      Noise: ${ann.noise}/10 | Light: ${ann.light}/10 | Crowd: ${ann.crowd}/10`);
    if (ann.notes) {
      console.log(`      Notes: ${ann.notes}`);
    }
    console.log("");
  }

  await wait(300);

  // Step 3: Show annotation flow
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("📍 STEP 2: Sensory Annotation Flow\n");
  console.log("Demonstrating how users contribute sensory data...\n");

  const annotationForm = {
    locationId: "oak-street-stop",
    locationName: "Oak Street Bus Stop",
    noise: 4,
    light: 6,
    crowd: 3,
    notes: "",
  };

  console.log("════════════════════════════════════════");
  console.log("📝 SENSORY ANNOTATION");
  console.log("════════════════════════════════════════");
  console.log(`Location: ${annotationForm.locationName}\n`);
  console.log("Rate the sensory environment at this location:\n");
  console.log(`🔊 ${renderSensoryLevel("Noise Level", annotationForm.noise)}`);
  console.log("   (0 = Silent, 10 = Very Loud)\n");
  console.log(`💡 ${renderSensoryLevel("Light Level", annotationForm.light)}`);
  console.log("   (0 = Very Dark, 10 = Very Bright)\n");
  console.log(`👥 ${renderSensoryLevel("Crowd Level", annotationForm.crowd)}`);
  console.log("   (0 = Empty, 10 = Very Crowded)\n");

  await wait(300);

  // Simulate user adjusting values
  console.log("\n[User adjusts: Noise +1, adds notes]\n");
  annotationForm.noise = 5;
  annotationForm.notes = "Sheltered stop, moderate traffic noise from street";

  console.log(`🔊 ${renderSensoryLevel("Noise Level", annotationForm.noise)}`);
  console.log(`📝 Notes: ${annotationForm.notes}\n`);

  await wait(300);

  // Submit
  console.log("[User submits annotation]\n");
  console.log("════════════════════════════════════════");
  console.log("✅ ANNOTATION SAVED");
  console.log("════════════════════════════════════════\n");
  console.log(`Thank you for contributing sensory data for:`);
  console.log(`📍 ${annotationForm.locationName}\n`);
  console.log("Your annotation helps other neurodiverse travelers");
  console.log("prepare for their journeys.\n");

  // Summary
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("MVP DEMO COMPLETE");
  console.log("═══════════════════════════════════════════════════════════════\n");
  console.log("The NAFA MVP demonstrates:");
  console.log("  ✓ Journey planning with sensory-aware route segments");
  console.log("  ✓ Sensory annotation collection for locations");
  console.log("  ✓ TEA (The Elm Architecture) pattern in ReScript");
  console.log("  ✓ Deno/Node server with REST API\n");
  console.log("Run commands:");
  console.log("  just mvp-demo      - Run this demo");
  console.log("  just mvp-server    - Start the API server");
  console.log("  just mvp-build     - Build ReScript modules\n");
}

runDemo();
