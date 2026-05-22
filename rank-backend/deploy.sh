#!/bin/bash
# Production Deployment Script

echo "🚀 Starting production deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level moderate

# Check environment variables
echo "🔧 Checking environment variables..."
if [ -z "$MONGODB_URI" ]; then
  echo "❌ MONGODB_URI is not set"
  exit 1
fi

if [ -z "$ADMIN_PASSWORD" ]; then
  echo "❌ ADMIN_PASSWORD is not set"
  exit 1
fi

# Start application
echo "✅ Starting application..."
NODE_ENV=production npm start