#!/bin/bash

# Script to stop the photo frame application
# This will properly terminate all related processes

# Navigate to the project directory (one level up from scripts folder)
cd "$(dirname "$0")/.."

echo "Stopping Photo Frame application..."

# Find and kill the Node.js process running main.js
if pgrep -f "node main.js" > /dev/null; then
    echo "Stopping Node.js process..."
    pkill -f "node main.js"
fi

# Find and kill any Chromium browser instances launched by puppeteer
if pgrep -f "chromium-browser" > /dev/null; then
    echo "Stopping Chromium browser..."
    pkill -f "chromium-browser"
fi

# Additional cleanup for any zombie processes
if pgrep -f "puppeteer" > /dev/null; then
    echo "Cleaning up puppeteer processes..."
    pkill -f "puppeteer"
fi

echo "Photo Frame application has been stopped."