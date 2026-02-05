#!/bin/bash

# Script to verify that predev runs before dev
# This starts some dummy processes and checks if they get killed

echo "🧪 Testing predev execution during yarn dev startup..."
echo ""

# Start dummy processes on a few ports
echo "Starting dummy processes..."
node -e "require('http').createServer((req,res)=>res.end('test')).listen(4000)" &
PID1=$!
node -e "require('http').createServer((req,res)=>res.end('test')).listen(3000)" &
PID2=$!
sleep 2

echo "  Port 4000: PID $PID1"
echo "  Port 3000: PID $PID2"
echo ""
echo "Now run 'yarn dev' in another terminal and watch for:"
echo "  🧹 [API Gateway] Cleaning port 4000..."
echo "  🧹 [Web] Cleaning port 3000..."
echo ""
echo "These messages confirm predev is running."
echo ""
echo "Press Ctrl+C when done testing, then run './scripts/cleanup-ports.sh' to clean up."
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Cleaning up test processes...'; kill $PID1 $PID2 2>/dev/null; exit 0" SIGINT SIGTERM
wait
