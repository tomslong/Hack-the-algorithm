#!/bin/bash

# Quick start script for DSA Learning Platform

echo "============================================="
echo "DSA Learning Platform - Quick Start"
echo "============================================="
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✓ Docker is installed"
    echo ""
    echo "Starting application with Docker..."
    docker-compose up --build
else
    echo "Docker is not installed. Starting with Python..."
    echo ""
    
    # Check if Python is installed
    if command -v python3 &> /dev/null; then
        echo "✓ Python 3 is installed"
        
        # Check if requirements are installed
        echo "Installing dependencies..."
        pip3 install -r requirements.txt
        
        echo ""
        echo "Starting Flask application..."
        python3 app.py
    else
        echo "✗ Python 3 is not installed"
        echo "Please install Python 3 or Docker to run this application"
        exit 1
    fi
fi
