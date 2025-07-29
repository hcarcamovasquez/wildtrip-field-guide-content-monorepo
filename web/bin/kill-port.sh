#!/bin/bash

# Script to kill process using port 4321 (or any port specified)
# Usage: ./kill-port.sh [port]
# Default port is 4321 if no argument provided

PORT=${1:-4321}

echo "Looking for process using port $PORT..."

# Find the PID using the port
PID=$(lsof -ti :$PORT)

if [ -z "$PID" ]; then
    echo "No process found using port $PORT"
    exit 0
fi

echo "Found process $PID using port $PORT"

# Kill the process
kill -9 $PID

if [ $? -eq 0 ]; then
    echo "Successfully killed process $PID on port $PORT"
else
    echo "Failed to kill process $PID"
    exit 1
fi