;; SPDX-License-Identifier: PMPL-1.0-or-later
;; STATE.scm - Project state for nafa-app
;; Media-Type: application/vnd.state+scm

(state
  (metadata
    (version "0.1.0")
    (schema-version "1.0")
    (created "2025-01-03")
    (updated "2026-03-02")
    (project "nafa-app")
    (repo "github.com/hyperpolymath/nafa-app"))

  (project-context
    (name "nafa-app")
    (tagline "Neurodiverse App for Adventurers -- journey planning with sensory awareness")
    (tech-stack ("ReScript" "Deno" "Nickel" "Tauri 2.0")))

  (current-position
    (phase "mvp-complete")
    (overall-completion 90)
    (components
      ("client/src/Main.res" "ReScript SPA entry point with TEA pattern" 100)
      ("client/src/Page/JourneyView.res" "Journey plan viewer with sensory indicators" 100)
      ("client/src/Page/Annotate.res" "Sensory annotation crowdsourcing form" 100)
      ("client/src/Page/Accessibility.res" "Accessibility settings (text, contrast, motion, haptics)" 100)
      ("client/src/Page/Offline.res" "Offline mode manager with sync support" 100)
      ("shared/src/Domain.res" "Core domain types (sensory, journey, accessibility, offline)" 100)
      ("shared/src/Route.res" "Type-safe URL routing" 100)
      ("server/src/main.js" "Deno HTTP server with REST API" 100)
      ("server/src/demo.js" "CLI demo showing all MVP features" 100)
      ("nickel-rituals/" "Badge and contributor tier logic" 100)
      ("Containerfile" "Chainguard Deno container build" 100)
      ("Tauri mobile" "iOS/Android via Tauri 2.0" 80))
    (working-features
      ("Journey planning with sensory-aware route segments")
      ("Crowdsourced sensory annotations (noise, light, crowd)")
      ("Accessibility settings (text size, contrast, motion, haptics, screen reader)")
      ("Offline mode with cached journeys and sync management")
      ("REST API for journey and annotation data")
      ("CLI demo for all features")))

  (route-to-mvp
    (milestones
      ("MVP complete" 100 "All core features implemented")
      ("Browser integration" 0 "Wire ReScript to DOM with index.html")
      ("Real routing data" 0 "Replace mocks with GraphHopper/OSM API")
      ("Tauri mobile" 80 "iOS/Android builds via Tauri 2.0")))

  (blockers-and-issues
    (critical)
    (high)
    (medium
      ("cadre-router not yet published to JSR")
      ("cadre-tea-router repo not yet created"))
    (low))

  (critical-next-actions
    (immediate
      ("Add browser entry point (index.html)"))
    (this-week
      ("Integrate rescript-tea for browser runtime"))
    (this-month
      ("Publish cadre-router to JSR")
      ("Create cadre-tea-router repo")))

  (session-history
    ("2026-03-02" "RSR compliance audit: fixed SPDX headers, license references, created .well-known/, CODEOWNERS, updated SCM files")))
