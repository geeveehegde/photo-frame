#!/bin/bash

# Installation script for Photo Frame on Raspberry Pi
# This script sets up the autostart configuration for the photo frame application

# Navigate to the project directory (one level up from scripts folder)
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "Starting installation for photo-frame on Raspberry Pi..."

# Update and upgrade system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required dependencies
echo "Installing required dependencies..."
# Check and install Chromium
if ! command -v chromium-browser &> /dev/null; then
    echo "Installing Chromium browser..."
    sudo apt install -y chromium-browser
else
    echo "Chromium browser is already installed."
fi

# Check and install FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "Installing FFmpeg..."
    sudo apt install -y ffmpeg
else
    echo "FFmpeg is already installed."
fi

# Check and install Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js is already installed. Version: $(node -v)"
fi

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Make the script files executable
chmod +x "$PROJECT_ROOT/autostart/autostart.sh"
chmod +x "$PROJECT_ROOT/scripts/stop.sh"

# Configure autostart
echo "Setting up autostart configuration..."
# Create autostart directory if it doesn't exist
mkdir -p ~/.config/autostart

# Copy the desktop file to the autostart directory
cp "$PROJECT_ROOT/autostart/photo-frame.desktop" ~/.config/autostart/

# Update the path in the desktop file to match the actual installation location
sed -i "s|/home/pi/photo-frame/autostart/autostart.sh|$PROJECT_ROOT/autostart/autostart.sh|g" ~/.config/autostart/photo-frame.desktop
sed -i "s|/home/pi/photo-frame|$PROJECT_ROOT|g" ~/.config/autostart/photo-frame.desktop

# Disable screen blanking in Raspberry Pi configuration
echo "Disabling screen blanking..."
if grep -q "xserver-command=X" /etc/lightdm/lightdm.conf; then
    sudo sed -i 's/xserver-command=X.*/xserver-command=X -s 0 -dpms/' /etc/lightdm/lightdm.conf
else
    echo "xserver-command=X -s 0 -dpms" | sudo tee -a /etc/lightdm/lightdm.conf
fi

# Add the autostart entries to config.txt for display settings
echo "Configuring display settings..."
if ! grep -q "disable_overscan=1" /boot/config.txt; then
    echo "disable_overscan=1" | sudo tee -a /boot/config.txt
fi

echo "Photo Frame has been set up to start automatically on boot!"
echo "You can manually start it by running ./autostart/autostart.sh"
echo "You can stop it by running ./scripts/stop.sh"