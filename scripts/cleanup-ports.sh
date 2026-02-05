#!/bin/bash

# Cleanup script to kill all development server ports
# This is useful when processes don't terminate properly on macOS

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧹 Cleaning up development server ports..."

# Array of ports used by the application
PORTS=(3000 4000 4001 4002 4003 4004 4005)

for PORT in "${PORTS[@]}"; do
  if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "  Cleaning port $PORT..."
    "$SCRIPT_DIR/kill-port-robust.sh" "$PORT" >/dev/null 2>&1
  fi
done

echo "✅ Port cleanup complete"
