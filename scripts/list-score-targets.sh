#!/usr/bin/env bash

set -euo pipefail

root_dir="${1:-.}"
projects=()

for project in backend customer-mobile operator-frontend; do
  if [[ -d "${root_dir}/${project}" ]]; then
    projects+=("${project}")
  fi
done

if [[ ${#projects[@]} -eq 0 ]]; then
  echo "[]"
  exit 0
fi

printf '%s\n' "${projects[@]}" | jq -R . | jq -s -c .
