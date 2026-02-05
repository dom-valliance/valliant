#!/bin/bash

# Robust port killer that waits for the port to be fully released
# Usage: ./kill-port-robust.sh <port>

PORT=$1

if [ -z "$PORT" ]; then
  echo "Usage: $0 <port>"
  exit 1
fi

# Check if anything is on the port
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  # echo "No process found on port $PORT"
  exit 0
fi

# Kill the process(es) forcefully
echo "Killing process(es) on port $PORT: $PID"
kill -9 $PID 2>/dev/null

# Wait for the port to be released (max 3 seconds)
for i in {1..6}; do
  sleep 0.5
  if ! lsof -ti:$PORT >/dev/null 2>&1; then
    # echo "Port $PORT is now free"
    exit 0
  fi
done

# If we get here, the port is still in use
echo "Warning: Port $PORT may still be in use"
exit 1
