// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * Domain Tests - NAFA Shared Types
 *
 * Tests for domain utility functions in Domain.res
 */

// Test helper: simple assertion
let assert = (label, condition) => {
  if !condition {
    Js.log("❌ FAIL: " ++ label)
  } else {
    Js.log("✓ PASS: " ++ label)
  }
}

let assertEqual = (label, actual, expected) => {
  if actual === expected {
    Js.log("✓ PASS: " ++ label)
  } else {
    Js.log("❌ FAIL: " ++ label ++ " (expected: " ++ expected ++ ", got: " ++ actual ++ ")")
  }
}

// Import domain module
module Domain = Domain

// Test suite: Transport Mode Functions

let testTransportModeToString = () => {
  Js.log("\n📋 Testing transportModeToString...")
  assertEqual("Walk to string", Domain.transportModeToString(Domain.Walk), "Walk")
  assertEqual("Bus to string", Domain.transportModeToString(Domain.Bus), "Bus")
  assertEqual("Train to string", Domain.transportModeToString(Domain.Train), "Train")
  assertEqual("Tram to string", Domain.transportModeToString(Domain.Tram), "Tram")
  assertEqual("Metro to string", Domain.transportModeToString(Domain.Metro), "Metro")
}

let testTransportModeToEmoji = () => {
  Js.log("\n🎨 Testing transportModeToEmoji...")
  assertEqual("Walk emoji", Domain.transportModeToEmoji(Domain.Walk), "🚶")
  assertEqual("Bus emoji", Domain.transportModeToEmoji(Domain.Bus), "🚌")
  assertEqual("Train emoji", Domain.transportModeToEmoji(Domain.Train), "🚆")
  assertEqual("Tram emoji", Domain.transportModeToEmoji(Domain.Tram), "🚊")
  assertEqual("Metro emoji", Domain.transportModeToEmoji(Domain.Metro), "🚇")
}

// Test suite: Sensory Level Description

let testSensoryLevelDescription = () => {
  Js.log("\n📊 Testing sensoryLevelDescription...")
  assertEqual("Level 0", Domain.sensoryLevelDescription(0), "Very Low")
  assertEqual("Level 2", Domain.sensoryLevelDescription(2), "Very Low")
  assertEqual("Level 3", Domain.sensoryLevelDescription(3), "Low")
  assertEqual("Level 4", Domain.sensoryLevelDescription(4), "Low")
  assertEqual("Level 5", Domain.sensoryLevelDescription(5), "Moderate")
  assertEqual("Level 6", Domain.sensoryLevelDescription(6), "Moderate")
  assertEqual("Level 7", Domain.sensoryLevelDescription(7), "High")
  assertEqual("Level 8", Domain.sensoryLevelDescription(8), "High")
  assertEqual("Level 9", Domain.sensoryLevelDescription(9), "Very High")
  assertEqual("Level 10", Domain.sensoryLevelDescription(10), "Very High")
}

// Test suite: Sensory Profile Validation

let testExceedsProfile = () => {
  Js.log("\n✅ Testing exceedsProfile...")

  let profile1 = {noise: 5, light: 5, crowd: 5}
  let profile2 = {noise: 6, light: 6, crowd: 6}

  // Levels below profile
  assert("Levels within profile", !Domain.exceedsProfile(profile1, profile2))

  // Levels exceed profile on one dimension
  let exceeding = {noise: 7, light: 5, crowd: 5}
  assert("Noise exceeds", Domain.exceedsProfile(exceeding, profile2))

  // Levels equal profile
  assert("Equal levels", !Domain.exceedsProfile(profile2, profile2))

  // All dimensions exceed
  let allExceed = {noise: 7, light: 7, crowd: 7}
  assert("All exceed", Domain.exceedsProfile(allExceed, profile2))
}

// Test suite: Journey Status

let testJourneyStatus = () => {
  Js.log("\n🗺️  Testing Journey Status...")

  // Create sample journey with different statuses
  let journey1: Domain.journey = {
    id: "j1",
    title: "Test Journey",
    segments: [],
    status: Domain.Planning,
    estimatedMinutes: 30,
    sensoryAnnotations: [],
  }

  assert("Journey has Planning status", journey1.status === Domain.Planning)

  let journey2 = {...journey1, status: Domain.Active}
  assert("Journey can have Active status", journey2.status === Domain.Active)

  let journey3 = {...journey1, status: Domain.Completed}
  assert("Journey can have Completed status", journey3.status === Domain.Completed)
}

// Test suite: Sensory Annotation

let testSensoryAnnotation = () => {
  Js.log("\n📍 Testing Sensory Annotations...")

  let annotation: Domain.sensoryAnnotation = {
    id: "ann-001",
    locationId: "loc-001",
    locationName: "Test Location",
    noise: 5,
    light: 6,
    crowd: 4,
    notes: Some("Test note"),
    timestamp: 1234567890.0,
  }

  assert("Annotation has id", annotation.id === "ann-001")
  assert("Annotation noise level valid", annotation.noise >= 0 && annotation.noise <= 10)
  assert("Annotation has optional notes", annotation.notes !== None)
}

// Test suite: Journey Segment

let testJourneySegment = () => {
  Js.log("\n🚌 Testing Journey Segments...")

  let segment: Domain.journeySegment = {
    id: "seg-001",
    transportMode: Domain.Bus,
    fromLocation: "Start",
    toLocation: "End",
    durationMinutes: 15,
    sensoryWarning: Some("Busy during rush hour"),
    sensoryLevels: Some({noise: 6, light: 4, crowd: 7}),
  }

  assert("Segment has transport mode", segment.transportMode === Domain.Bus)
  assert("Segment has duration", segment.durationMinutes > 0)
  assert("Segment has optional warning", segment.sensoryWarning !== None)
  assert("Segment has optional sensory levels", segment.sensoryLevels !== None)
}

// Run all tests

let () = {
  Js.log(`
╔══════════════════════════════════════════════════════════╗
║     NAFA Shared Domain - Test Suite                      ║
║     Testing ReScript domain module                       ║
╚══════════════════════════════════════════════════════════╝
`)

  testTransportModeToString()
  testTransportModeToEmoji()
  testSensoryLevelDescription()
  testExceedsProfile()
  testJourneyStatus()
  testSensoryAnnotation()
  testJourneySegment()

  Js.log(`
╔══════════════════════════════════════════════════════════╗
║  ✅ All domain tests completed                            ║
╚══════════════════════════════════════════════════════════╝
`)
}
