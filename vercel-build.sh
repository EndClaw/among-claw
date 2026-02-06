#!/bin/bash

# Custom build script for Vercel
# Ensures all dependencies are installed before building

echo "🔧 Installing dependencies..."
npm install

echo "✅ Dependencies installed"
echo "🏗️ Building Next.js..."
npm run build

echo "✅ Build complete"
