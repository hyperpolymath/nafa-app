// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
//
// Bun test wrapper for the compiled AffineScript helper suite.
// helpers_test.deno.js is compiler output of helpers_test.affine: it runs
// its 15 cases at import time and aborts on the first failure, so the
// import resolving cleanly is the pass condition.

import { expect, test } from "bun:test";

test("AffineScript helper suite (helpers_test.affine) passes", async () => {
  await expect(import("./helpers_test.deno.js")).resolves.toBeDefined();
});
