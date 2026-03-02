;; SPDX-License-Identifier: PMPL-1.0-or-later
;; ECOSYSTEM.scm - Ecosystem position for nafa-app
;; Media-Type: application/vnd.ecosystem+scm

(ecosystem
  (version "1.0")
  (name "nafa-app")
  (type "application")
  (purpose "Journey planning app for neurodiverse adventurers with sensory awareness, accessibility, and offline support")

  (position-in-ecosystem
    (category "applications")
    (subcategory "accessibility-tools")
    (unique-value
      ("Sensory-aware route planning for neurodiverse users")
      ("Crowdsourced sensory annotations for locations")
      ("Comprehensive accessibility settings including haptics and screen reader")
      ("Offline-first architecture with sync management")))

  (related-projects
    ("cadre-router" "sibling-standard" "Type-safe URL routing library (planned dependency)")
    ("cadre-tea-router" "sibling-standard" "TEA integration bridge for cadre-router (planned)")
    ("proven" "potential-consumer" "Formal verification library for safe data structures")
    ("rescript-tea" "dependency" "TEA framework for ReScript"))

  (what-this-is
    ("A journey planning app for neurodiverse adventurers")
    ("A ReScript + Deno application following TEA pattern")
    ("A sensory-aware navigation tool with crowdsourced data")
    ("An accessibility-first app with offline support"))

  (what-this-is-not
    ("Not a general-purpose navigation app")
    ("Not a social media platform")
    ("Not a medical or diagnostic tool")))
