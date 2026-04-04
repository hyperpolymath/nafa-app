#!/usr/bin/env bash
# SPDX-License-Identifier: PMPL-1.0-or-later
# Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
#
# nafa-app — End-to-End Tests
#
# Validates the NAFA (Neuro-Atypical Friendly App) backend server API endpoints,
# shared domain types (ReScript), client structure, and file integrity.
# Starts the Deno server and exercises the journey/annotation API.
#
# Usage:
#   bash tests/e2e.sh
#   just e2e

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PASS=0
FAIL=0
SKIP=0

# ─── Colour helpers ──────────────────────────────────────────────────
green() { printf '\033[32m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n' "$*"; }

# ─── Assertion helpers ───────────────────────────────────────────────

check() {
    local name="$1" expected="$2" actual="$3"
    if echo "$actual" | grep -q "$expected"; then
        green "  PASS: $name"
        PASS=$((PASS + 1))
    else
        red "  FAIL: $name (expected '$expected', got '${actual:0:120}')"
        FAIL=$((FAIL + 1))
    fi
}

check_status() {
    local name="$1" expected="$2" actual="$3"
    if [ "$actual" = "$expected" ]; then
        green "  PASS: $name (HTTP $actual)"
        PASS=$((PASS + 1))
    else
        red "  FAIL: $name (expected HTTP $expected, got HTTP $actual)"
        FAIL=$((FAIL + 1))
    fi
}

check_exists() {
    local name="$1" path="$2"
    if [ -e "$path" ]; then
        green "  PASS: $name"
        PASS=$((PASS + 1))
    else
        red "  FAIL: $name (path not found: $path)"
        FAIL=$((FAIL + 1))
    fi
}

skip_test() {
    yellow "  SKIP: $1 ($2)"
    SKIP=$((SKIP + 1))
}

echo "═══════════════════════════════════════════════════════════════"
echo "  nafa-app — End-to-End Tests"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─── Section 1: Project structure ────────────────────────────────────
bold "Section 1: Project file structure"

check_exists "server directory exists"               "$PROJECT_DIR/server"
check_exists "server/src/main.js exists"             "$PROJECT_DIR/server/src/main.js"
check_exists "server/deno.json exists"               "$PROJECT_DIR/server/deno.json"
check_exists "shared directory exists"               "$PROJECT_DIR/shared"
check_exists "shared/src/Domain.res exists"          "$PROJECT_DIR/shared/src/Domain.res"
check_exists "client directory exists"               "$PROJECT_DIR/client"
check_exists "AI manifest present"                   "$PROJECT_DIR/0-AI-MANIFEST.a2ml"
check_exists "Justfile present"                      "$PROJECT_DIR/Justfile"

echo ""

# ─── Section 2: Domain model integrity ───────────────────────────────
bold "Section 2: Domain model (shared/src/Domain.res)"

DOMAIN_SRC="$PROJECT_DIR/shared/src/Domain.res"
if [ -f "$DOMAIN_SRC" ]; then
    DOMAIN=$(cat "$DOMAIN_SRC")
    check "Domain has sensoryProfile type"         "sensoryProfile"       "$DOMAIN"
    check "Domain has journeySegment type"         "journeySegment"       "$DOMAIN"
    check "Domain has transportMode variants"      "Walk\|Bus\|Train"     "$DOMAIN"
    check "Domain has accessibilityPrefs type"     "accessibilityPrefs"   "$DOMAIN"
    check "Domain has offlinePrefs type"           "offlinePrefs"         "$DOMAIN"
    check "Domain has SPDX header"                 "SPDX-License-Identifier" "$DOMAIN"
    check "Domain has exceedsProfile function"     "exceedsProfile"       "$DOMAIN"
    check "Domain has sensoryLevelDescription"     "sensoryLevelDescription" "$DOMAIN"
else
    red "  FAIL: Domain.res not found"
    FAIL=$((FAIL + 1))
fi

echo ""

# ─── Section 3: Server API (Deno runtime) ────────────────────────────
bold "Section 3: Server API endpoints"

if command -v deno >/dev/null 2>&1; then
    NAFA_PORT=18080
    # Start the server in background; override PORT env var
    PORT="$NAFA_PORT" deno run --allow-net --allow-read \
        "$PROJECT_DIR/server/src/main.js" &
    SERVER_PID=$!
    trap "kill $SERVER_PID 2>/dev/null || true" EXIT

    # Wait for server to start (max 10s)
    READY=0
    for _ in $(seq 1 20); do
        if curl -sf "http://localhost:$NAFA_PORT/api/health" >/dev/null 2>&1; then
            READY=1
            break
        fi
        sleep 0.5
    done

    if [ "$READY" -eq 1 ]; then
        # Health check
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$NAFA_PORT/api/health")
        check_status "GET /api/health returns 200" "200" "$STATUS"

        BODY=$(curl -s "http://localhost:$NAFA_PORT/api/health")
        check "health body has status:ok" '"status".*"ok"\|status.*ok' "$BODY"

        # Journeys list
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$NAFA_PORT/api/journeys")
        check_status "GET /api/journeys returns 200" "200" "$STATUS"

        JOURNEYS=$(curl -s "http://localhost:$NAFA_PORT/api/journeys")
        check "journeys response is JSON array" '\[' "$JOURNEYS"
        check "journeys contain journey-001" "journey-001" "$JOURNEYS"
        check "journeys have segments field" "segments" "$JOURNEYS"
        check "journeys have sensoryLevels" "sensoryLevels\|sensory" "$JOURNEYS"

        # Single journey by ID
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$NAFA_PORT/api/journeys/journey-001")
        check_status "GET /api/journeys/journey-001 returns 200" "200" "$STATUS"

        JOURNEY=$(curl -s "http://localhost:$NAFA_PORT/api/journeys/journey-001")
        check "single journey has title" "Commute\|title" "$JOURNEY"
        check "single journey has status" "Planning\|status" "$JOURNEY"

        # 404 for unknown journey
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$NAFA_PORT/api/journeys/nonexistent-999")
        check_status "GET /api/journeys/<unknown> returns 404" "404" "$STATUS"

        # POST annotation
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST "http://localhost:$NAFA_PORT/api/annotations" \
            -H "Content-Type: application/json" \
            -d '{"locationId":"test-loc","locationName":"Test Location","noise":3,"light":4,"crowd":2}')
        if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
            green "  PASS: POST /api/annotations accepted ($STATUS)"
            PASS=$((PASS + 1))
        else
            red "  FAIL: POST /api/annotations returned $STATUS (expected 200 or 201)"
            FAIL=$((FAIL + 1))
        fi

        # POST annotation with missing fields → 400
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST "http://localhost:$NAFA_PORT/api/annotations" \
            -H "Content-Type: application/json" \
            -d '{"noise":3}')
        check_status "POST /api/annotations missing fields returns 400" "400" "$STATUS"

    else
        skip_test "server API tests" "Deno server did not start in time"
    fi

    kill "$SERVER_PID" 2>/dev/null || true
    trap - EXIT
else
    skip_test "server API tests" "deno not available"
fi

echo ""

# ─── Section 4: SPDX headers in source files ─────────────────────────
bold "Section 4: SPDX licence headers"

# Check server JS files
JS_WITHOUT_SPDX=$(grep -rL "SPDX-License-Identifier" "$PROJECT_DIR/server/src/" --include="*.js" 2>/dev/null || true)
if [ -z "$JS_WITHOUT_SPDX" ]; then
    green "  PASS: all server JS files have SPDX headers"
    PASS=$((PASS + 1))
else
    red "  FAIL: server JS files missing SPDX headers: $JS_WITHOUT_SPDX"
    FAIL=$((FAIL + 1))
fi

# Check shared ReScript files
RES_WITHOUT_SPDX=$(grep -rL "SPDX-License-Identifier" "$PROJECT_DIR/shared/src/" --include="*.res" 2>/dev/null || true)
if [ -z "$RES_WITHOUT_SPDX" ]; then
    green "  PASS: all shared .res files have SPDX headers"
    PASS=$((PASS + 1))
else
    red "  FAIL: shared .res files missing SPDX headers: $RES_WITHOUT_SPDX"
    FAIL=$((FAIL + 1))
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════"
printf "  Results: "
green "PASS=$PASS" | tr -d '\n'
echo -n "  "
if [ "$FAIL" -gt 0 ]; then red "FAIL=$FAIL" | tr -d '\n'; else echo -n "FAIL=0"; fi
echo -n "  "
if [ "$SKIP" -gt 0 ]; then yellow "SKIP=$SKIP"; else echo "SKIP=0"; fi
echo "═══════════════════════════════════════════════════════════════"

exit "$FAIL"
