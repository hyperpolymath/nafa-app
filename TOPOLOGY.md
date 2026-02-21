<!-- SPDX-License-Identifier: PMPL-1.0-or-later -->
<!-- TOPOLOGY.md — Project architecture map and completion dashboard -->
<!-- Last updated: 2026-02-19 -->

# NAFA — Project Topology

## System Architecture

```
                        ┌─────────────────────────────────────────┐
                        │              ADVENTURER                 │
                        │        (Mobile App / Desktop GUI)       │
                        └───────────────────┬─────────────────────┘
                                            │
                                            ▼
                        ┌─────────────────────────────────────────┐
                        │           APPLICATION LAYER             │
                        │  ┌───────────┐  ┌───────────────────┐  │
                        │  │ ReScript  │  │  Tauri 2.0        │  │
                        │  │ Frontend  │  │  (Rust Backend)   │  │
                        │  │ (TEA)     │  │                   │  │
                        │  └─────┬─────┘  └────────┬──────────┘  │
                        └────────│─────────────────│──────────────┘
                                 │                 │
                                 ▼                 ▼
                        ┌─────────────────────────────────────────┐
                        │           SERVER LAYER (DENO)           │
                        │    (REST API, Sensory Annotations)      │
                        └──────────┬───────────────────┬──────────┘
                                   │                   │
                                   ▼                   ▼
                        ┌───────────────────────┐  ┌────────────────────────────────┐
                        │ NICKEL RITUALS        │  │ EXTERNAL DATA                  │
                        │ - Badge Logic         │  │ - OpenStreetMap (planned)      │
                        │ - Contributor Tiers   │  │ - GraphHopper (planned)        │
                        └───────────────────────┘  └────────────────────────────────┘

                        ┌─────────────────────────────────────────┐
                        │          REPO INFRASTRUCTURE            │
                        │  Justfile Automation  .machine_readable/  │
                        │  Containerfile (Deno) 0-AI-MANIFEST.a2ml  │
                        └─────────────────────────────────────────┘
```

## Completion Dashboard

```
COMPONENT                          STATUS              NOTES
─────────────────────────────────  ──────────────────  ─────────────────────────────────
CLIENT & MOBILE
  ReScript SPA (TEA)                ██████████ 100%    Core journey views stable
  Tauri 2.0 Integration             ████████░░  80%    Mobile strategy verified
  Accessibility Settings            ██████████ 100%    Contrast/Motion hooks active
  Offline Mode                      ██████████ 100%    Cached journeys verified

SERVER & LOGIC
  Deno HTTP Server                  ██████████ 100%    REST API verified
  Sensory Annotations               ██████████ 100%    Crowdsourced data stable
  Nickel Rituals (Badges)           ██████████ 100%    Contributor tiers verified

REPO INFRASTRUCTURE
  Justfile Automation               ██████████ 100%    mvp-* tasks verified
  .machine_readable/                ██████████ 100%    STATE tracking active
  Container Build                   ██████████ 100%    Wolfi/Deno build stable

─────────────────────────────────────────────────────────────────────────────
OVERALL:                            █████████░  ~90%   MVP complete, mobile maturing
```

## Key Dependencies

```
Nickel Rituals ───► Contributor Tier ───► Badge UI ──────► Adventurer
     │                   │                   │                 │
     ▼                   ▼                   ▼                 ▼
Sensory Data ─────► Deno Server ──────► ReScript Client ──► Journey Plan
```

## Update Protocol

This file is maintained by both humans and AI agents. When updating:

1. **After completing a component**: Change its bar and percentage
2. **After adding a component**: Add a new row in the appropriate section
3. **After architectural changes**: Update the ASCII diagram
4. **Date**: Update the `Last updated` comment at the top of this file

Progress bars use: `█` (filled) and `░` (empty), 10 characters wide.
Percentages: 0%, 10%, 20%, ... 100% (in 10% increments).
