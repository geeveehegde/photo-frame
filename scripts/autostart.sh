#!/bin/bash

# Photo Frame auto-start script for Raspberry Pi
# This script automatically launches the photo frame application

# Navigate to the project directory (one level up from scripts folder)
cd "$(dirname "$0")/.."

# Make sure Node.js is in the PATH (Raspberry Pi path)
export PATH=$PATH:/usr/bin:/usr/local/bin

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to run this application."
    exit 1
fi

# Check for required dependencies (Chromium on Raspberry Pi)
if ! command -v chromium-browser &> /dev/null; then
    echo "chromium-browser not found. Please install it to run this application."
    exit 1
fi

# Set display for headless environment (important for autostart on Raspberry Pi)
export DISPLAY=:0

# Disable screen blanking and screensaver
xset s off
xset s noblank
xset -dpms

# Log startup information
echo "Starting Photo Frame application at $(date)" >> photoframe.log

# Run the bundled photoframe.js file using Node.js
node photoframe.js >> photoframe.log 2>&1

# Exit with the same status as the Node.js process
exit $?