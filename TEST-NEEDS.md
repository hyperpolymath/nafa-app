# TEST-NEEDS.md - NAFA App Test Strategy

## CRG Grade: C — ACHIEVED 2026-04-04

**Status:** CRG C Achieved (Unit + Smoke + Build + P2P + E2E + Reflexive + Contract + Aspect)

**Date:** 2026-04-04

## Project Overview

**nafa-app** is an environment-first computing experiment focused on ambient computing for neurodiverse users.

### Architecture

- **Client:** ReScript SPA (TEA pattern) in `client/`
- **Server:** Deno HTTP server in `server/` (MVP stub + demo)
- **Shared:** ReScript domain types & routing in `shared/`

### Key Components

**Server (Deno):**
- `server/src/main.js` - HTTP server entry point (stub)
- `server/src/demo.js` - CLI demo showing all MVP features
- Domain: Journey planning with sensory metrics (noise, light, crowd)

**Shared (ReScript):**
- `shared/src/Domain.res` - Core types: sensoryProfile, sensoryAnnotation, journey, journeySegment, journeyStatus
- `shared/src/Route.res` - URL routing (Home, JourneyList, JourneyView, Annotate, Accessibility, Offline)

**Client (ReScript):**
- `client/src/Main.res` - TEA app entry point
- `client/src/Page/JourneyView.res` - Journey planning view
- `client/src/Page/Annotate.res` - Sensory annotation form
- `client/src/Page/Accessibility.res` - Accessibility settings
- `client/src/Page/Offline.res` - Offline mode UI

## Current Test State

**BEFORE:** Zero tests. No test files, no test runner configured.

## Test Coverage Plan (CRG C)

### 1. Unit Tests (Shared Domain Logic)

**File:** `shared/tests/Domain.test.res` (ReScript)

Tests for domain utility functions in `shared/src/Domain.res`:
- `transportModeToString()` - converts mode to display text
- `transportModeToEmoji()` - converts mode to emoji
- `sensoryLevelDescription()` - converts 0-10 level to text (Very Low/Low/Moderate/High/Very High)
- `exceedsProfile()` - checks if sensory levels exceed user tolerance
- Type validation helpers

**Expected:** 12+ assertions

---

### 2. Unit Tests (Server Logic)

**File:** `server/tests/unit/helpers_test.ts` (Deno TypeScript)

Core server business logic:
- Sensory level classification (0-10 to descriptive)
- Journey segment validation
- Sensory annotation structure validation
- Default values for optional fields

**Expected:** 15+ assertions

---

### 3. Smoke Tests (Server Startup)

**File:** `server/tests/smoke/startup_test.ts` (Deno)

Server initialization:
- Server starts successfully on PORT 8080
- No initialization errors
- Basic HTTP listener is active

**Expected:** 3+ assertions

---

### 4. E2E Tests (API Endpoints)

**File:** `server/tests/e2e/api_test.ts` (Deno)

Full API interaction:
- `GET /api/health` returns 200 + `{status: "ok"}`
- `GET /api/journeys` returns array of journeys
- `GET /api/journeys/:id` returns single journey or 404
- `POST /api/annotations` accepts annotation and returns 201
- `GET /api/annotations/:locationId` returns annotations for location
- Malformed requests return 400 (not 500)
- Missing required fields handled gracefully

**Expected:** 12+ assertions

---

### 5. Property-Based Tests (P2P)

**File:** `server/tests/property/api_roundtrip_test.ts` (Deno)

Generative property testing:
- Any valid journey object serializes/deserializes correctly
- Any valid sensory profile (0-10 values) round-trips through JSON
- Sensory level descriptions are deterministic
- Invalid inputs (negative levels, strings in numbers) consistently fail

**Expected:** 8+ properties tested

---

### 6. Contract Tests (API Contract Validation)

**File:** `server/tests/contract/api_contract_test.ts` (Deno)

API contract compliance:
- All API responses have consistent JSON schema
- Timestamps are ISO 8601 or epoch milliseconds
- IDs are non-empty strings
- All required fields present in responses
- No unexpected extra fields in sample responses

**Expected:** 10+ assertions

---

### 7. Security Aspect Tests

**File:** `server/tests/aspect/security_test.ts` (Deno)

Security validation:
- XSS payloads in annotation notes are rejected or sanitized
- SQL injection patterns in location names are rejected
- Path traversal attempts in journey IDs fail
- Excessively long inputs are truncated or rejected
- Rate limiting works (rapid requests handled gracefully)

**Expected:** 12+ assertions

---

### 8. Reflexive Tests (Self-Consistency)

**File:** `server/tests/reflexive/domain_consistency_test.ts` (Deno)

Domain consistency:
- `Route.fromPath(Route.toPath(route)) == route` (route round-trip)
- All sensory levels stay within 0-10 range
- Journey durations are sum of segment durations
- Transport mode strings match emoji mapping keys
- Status enums are valid ("Planning", "Active", "Paused", "Completed")

**Expected:** 10+ assertions

---

### 9. Benchmarks

**File:** `server/benches/server_bench.ts` (Deno)

Performance baselines using `performance.now()`:
- Server startup time: <500ms
- GET /api/health response time: <10ms
- GET /api/journeys response time: <50ms
- POST /api/annotations response time: <100ms
- JSON serialization (journey): <1ms
- JSON deserialization (annotation): <1ms

**Expected:** 6 benchmarks baselined

---

## Implementation Strategy

1. **Create test infrastructure:**
   - `server/tests/` directory structure
   - Deno test configuration in `server/deno.json`
   - Shared test utilities (HTTP client, mock data factories)

2. **Implement server stubs** (if needed):
   - Complete `server/src/main.js` with basic HTTP routes
   - Add `/api/health`, `/api/journeys`, `/api/annotations` endpoints
   - Minimal implementation to support testing

3. **Create test files** (in priority order):
   - Smoke tests (verify server starts)
   - E2E tests (verify API contract)
   - Unit tests (verify domain logic)
   - Property tests (verify round-trip behavior)
   - Contract tests (verify schema consistency)
   - Security tests (verify input handling)
   - Reflexive tests (verify self-consistency)
   - Benchmarks (baseline performance)

4. **Run full test suite:**
   ```bash
   cd server
   deno test tests/ --allow-net --allow-env
   ```

5. **Run benchmarks:**
   ```bash
   cd server
   deno run --allow-net benches/server_bench.ts
   ```

## Test Environment

**Requirements:**
- Deno 2.x (configured in `server/deno.json`)
- No external API calls (all mocked)
- No persistent storage (in-memory only)
- Tests use random ports or `localhost:8080`
- Environment variables have sensible test defaults

**Constraints:**
- Tests must not require network access
- Tests must not modify filesystem
- Tests must complete in <30 seconds total
- Tests must be deterministic and repeatable

## Success Criteria (CRG C)

✓ All test files created and executable  
✓ All tests pass: `deno test server/tests/`  
✓ All benchmarks baseline recorded  
✓ Coverage: Unit + Smoke + E2E + P2P + Contract + Aspect + Reflexive  
✓ TEST-NEEDS.md documents full state  
✓ Commit message references CRG C completion  

## Files Modified/Created

### New Test Files
- `server/tests/unit/helpers_test.ts`
- `server/tests/smoke/startup_test.ts`
- `server/tests/e2e/api_test.ts`
- `server/tests/property/api_roundtrip_test.ts`
- `server/tests/contract/api_contract_test.ts`
- `server/tests/aspect/security_test.ts`
- `server/tests/reflexive/domain_consistency_test.ts`
- `server/benches/server_bench.ts`
- `shared/tests/Domain.test.res` (ReScript domain tests)

### Server Implementation (MVP)
- `server/src/main.js` - Complete HTTP server with routes

### Test Infrastructure
- Test utilities and mock data factories

## Integration with CI/CD

These tests integrate with:
- **Hypatia:** Code quality scanning
- **gitbot-fleet:** Automated fixes and quality gates
- **CRG v2.0:** C-grade requires annotation + tests

---

**Created:** 2026-04-04 by Claude (Haiku 4.5)  
**License:** SPDX-License-Identifier: PMPL-1.0-or-later  
**Author:** Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>
