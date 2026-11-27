# SPDX-License-Identifier: MPL-2.0
# SPDX-FileCopyrightText: 2025 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
#
# === NAFA Containerfile (Bun Runtime) ===
#
# Runs the NAFA server on Bun.
# Uses Chainguard's Bun image for minimal CVE surface.
# The server has no runtime dependencies, so there is no install step.
#
# TODO: Migrate to Cerro Torre (hyperpolymath/cerro-torre) when Phase 1
#       ships with OCI image output. Cerro Torre provides:
#       - Provenance-verified packages from democratic governance
#       - Ada/SPARK tooling with formal verification
#       - Complete supply-chain transparency
#       See: https://github.com/hyperpolymath/cerro-torre
#

# Chainguard Bun: minimal attack surface, signed images, near-zero CVEs
FROM cgr.dev/chainguard/bun:latest AS runtime

WORKDIR /app

# Copy server source
COPY server/ ./server/
COPY shared/ ./shared/

# Set environment (listen on all interfaces inside the container)
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose the port
EXPOSE 8080

# Chainguard images run as nonroot by default; the entrypoint is bun
CMD ["run", "server/src/main.js"]
