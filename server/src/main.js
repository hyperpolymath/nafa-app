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
};

// ... [HTTP server initialization and route handling]
