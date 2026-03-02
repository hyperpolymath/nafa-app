;; SPDX-License-Identifier: PMPL-1.0-or-later
;; META.scm - Meta-level information for nafa-app
;; Media-Type: application/meta+scheme

(meta
  (architecture-decisions
    (adr-001
      (title "Use ReScript with TEA pattern for client")
      (status "accepted")
      (rationale "Sound type system, exhaustive pattern matching, clean JS output, natural TEA support"))
    (adr-002
      (title "Use Deno for server runtime")
      (status "accepted")
      (rationale "Secure by default, built-in TypeScript support, JSR for packages, no node_modules"))
    (adr-003
      (title "Tauri 2.0 for mobile")
      (status "accepted")
      (rationale "Rust backend + web UI, single codebase for iOS/Android/desktop, no Kotlin/Swift"))
    (adr-004
      (title "Nickel for badge/tier configuration")
      (status "accepted")
      (rationale "Typed configuration language, appropriate for declarative badge logic")))

  (development-practices
    (code-style
      ("ReScript TEA pattern for all client modules")
      ("Shared domain types across client and server")
      ("Deno-first JavaScript with explicit permissions"))
    (security
      (principle "Defense in depth")
      (principle "Secure by default (Deno permissions)"))
    (testing
      ("Unit tests for domain logic (planned)")
      ("CLI demo validates feature flow"))
    (versioning "SemVer")
    (documentation "AsciiDoc")
    (branching "main for stable"))

  (design-rationale
    ("Accessibility is a first-class concern, not an afterthought")
    ("Sensory awareness helps neurodiverse users plan safer journeys")
    ("Offline support ensures reliability in all connectivity conditions")
    ("Crowdsourced data builds community and improves accuracy")))
