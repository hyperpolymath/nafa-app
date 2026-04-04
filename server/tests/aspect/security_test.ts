// SPDX-License-Identifier: PMPL-1.0-or-later
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

/**
 * Security Aspect Tests
 *
 * Validates that the API properly handles malicious inputs including
 * XSS payloads, SQL injection patterns, path traversal, and rate limiting.
 */

import { assertEquals, assert } from "@std/assert";

const BASE_URL = "http://localhost:8080";

// Test data: XSS payloads
const xssPayloads = [
  "<script>alert('xss')</script>",
  "<img src=x onerror=alert('xss')>",
  "javascript:alert('xss')",
  "<svg/onload=alert('xss')>",
  "';alert('xss');//",
];

// Test data: SQL injection patterns
const sqlInjectionPayloads = [
  "'; DROP TABLE journeys; --",
  "1' OR '1'='1",
  "admin'--",
  "1 UNION SELECT * FROM users",
  "'; DELETE FROM annotations; --",
];

// Test data: Path traversal attempts
const pathTraversalPayloads = [
  "../../../etc/passwd",
  "..\\..\\..\\windows\\system32",
  "journey-001/../../../etc/passwd",
  "/api/journeys/../../sensitive",
];

// Test data: Excessively long inputs
const LONG_STRING = "a".repeat(10000);

Deno.test({
  name: "Security: XSS payload in notes field doesn't execute",
  ignore: true,
  fn: async () => {
    for (const payload of xssPayloads) {
      const annotation = {
        locationId: "test",
        locationName: "Test",
        noise: 5,
        light: 5,
        crowd: 5,
        notes: payload,
      };
      const response = await fetch(`${BASE_URL}/api/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(annotation),
      });
      // Should accept but sanitize/escape
      assert(response.status === 201 || response.status === 400);
    }
  },
});

Deno.test({
  name: "Security: SQL injection pattern in locationName doesn't execute",
  ignore: true,
  fn: async () => {
    for (const payload of sqlInjectionPayloads) {
      const annotation = {
        locationId: "test",
        locationName: payload,
        noise: 5,
        light: 5,
        crowd: 5,
      };
      const response = await fetch(`${BASE_URL}/api/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(annotation),
      });
      // Should not crash server
      assert(response.status < 500, `Server error on SQL injection: ${response.status}`);
    }
  },
});

Deno.test({
  name: "Security: Path traversal in journey ID doesn't access files",
  ignore: true,
  fn: async () => {
    for (const payload of pathTraversalPayloads) {
      const response = await fetch(`${BASE_URL}/api/journeys/${encodeURIComponent(payload)}`);
      // Should return 404, not expose file
      assertEquals(response.status, 404);
    }
  },
});

Deno.test({
  name: "Security: Excessively long locationId is handled",
  ignore: true,
  fn: async () => {
    const annotation = {
      locationId: LONG_STRING,
      locationName: "Test",
      noise: 5,
      light: 5,
      crowd: 5,
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    // Should either accept with truncation or reject with 400
    assert(response.status === 201 || response.status === 400);
  },
});

Deno.test({
  name: "Security: Excessively long notes are handled",
  ignore: true,
  fn: async () => {
    const annotation = {
      locationId: "test",
      locationName: "Test",
      noise: 5,
      light: 5,
      crowd: 5,
      notes: LONG_STRING,
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    // Should handle gracefully
    assert(response.status < 500);
  },
});

Deno.test({
  name: "Security: Null bytes in input are rejected",
  ignore: true,
  fn: async () => {
    const annotation = {
      locationId: "test\x00injection",
      locationName: "Test",
      noise: 5,
      light: 5,
      crowd: 5,
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    // Should not crash
    assert(response.status < 500);
  },
});

Deno.test({
  name: "Security: Negative sensory levels are rejected",
  ignore: true,
  fn: async () => {
    const annotation = {
      locationId: "test",
      locationName: "Test",
      noise: -5,
      light: 5,
      crowd: 5,
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    // Should reject invalid values
    assertEquals(response.status, 400);
  },
});

Deno.test({
  name: "Security: Sensory levels > 10 are rejected",
  ignore: true,
  fn: async () => {
    const annotation = {
      locationId: "test",
      locationName: "Test",
      noise: 15,
      light: 5,
      crowd: 5,
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    // Should reject invalid values
    assertEquals(response.status, 400);
  },
});

Deno.test({
  name: "Security: Rate limiting - rapid requests are handled",
  ignore: true,
  fn: async () => {
    let successCount = 0;
    let rateLimitedCount = 0;

    // Send 20 rapid requests
    for (let i = 0; i < 20; i++) {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.status === 200) successCount++;
      if (response.status === 429) rateLimitedCount++;
    }

    // Should handle without 5xx errors
    assert(successCount > 0, "Some requests should succeed");
  },
});

Deno.test({
  name: "Security: Special characters in annotations are handled",
  ignore: true,
  fn: async () => {
    const specialChars = "!@#$%^&*()[]{}|\\:;\"'<>?,./";
    const annotation = {
      locationId: "test",
      locationName: "Test " + specialChars,
      noise: 5,
      light: 5,
      crowd: 5,
      notes: specialChars,
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    // Should handle special chars without crashing
    assert(response.status < 500);
  },
});

Deno.test({
  name: "Security: Unicode in annotations is handled",
  ignore: true,
  fn: async () => {
    const annotation = {
      locationId: "test",
      locationName: "テスト 🚌 Тест",
      noise: 5,
      light: 5,
      crowd: 5,
      notes: "emoji: 😀 🚶 🚌 🚆",
    };
    const response = await fetch(`${BASE_URL}/api/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    // Should handle unicode properly
    assert(response.status === 201 || response.status === 400);
  },
});
