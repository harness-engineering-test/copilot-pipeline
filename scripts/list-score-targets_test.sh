#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
script_path="${repo_root}/scripts/list-score-targets.sh"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "${tmp_dir}"' EXIT

assert_eq() {
  local expected="$1"
  local actual="$2"
  local message="$3"

  if [[ "${expected}" != "${actual}" ]]; then
    echo "Assertion failed: ${message}" >&2
    echo "Expected: ${expected}" >&2
    echo "Actual:   ${actual}" >&2
    exit 1
  fi
}

assert_eq "[]" "$("${script_path}" "${tmp_dir}")" "returns empty array when no target directories exist"

mkdir -p "${tmp_dir}/operator-frontend"
assert_eq "[\"operator-frontend\"]" "$("${script_path}" "${tmp_dir}")" "returns a single existing target"

mkdir -p "${tmp_dir}/backend" "${tmp_dir}/customer-mobile"
assert_eq "[\"backend\",\"customer-mobile\",\"operator-frontend\"]" "$("${script_path}" "${tmp_dir}")" "returns targets in stable order"

echo "All list-score-targets tests passed."
