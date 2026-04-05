#!/usr/bin/env bash

set -euo pipefail

run_node_lint() {
  if [[ ! -f package.json ]]; then
    return 1
  fi

  if command -v node >/dev/null 2>&1; then
    if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.lint ? 0 : 1)" >/dev/null 2>&1; then
      if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
        pnpm lint
        return 0
      fi

      if [[ -f yarn.lock ]] && command -v yarn >/dev/null 2>&1; then
        yarn lint
        return 0
      fi

      if command -v npm >/dev/null 2>&1; then
        npm run lint
        return 0
      fi
    fi
  fi

  return 1
}

run_go_lint() {
  if [[ -f go.mod ]] && command -v golangci-lint >/dev/null 2>&1; then
    golangci-lint run ./...
    return 0
  fi

  return 1
}

if run_node_lint; then
  exit 0
fi

if run_go_lint; then
  exit 0
fi

echo "No lint command configured; skipping post-tool lint."
