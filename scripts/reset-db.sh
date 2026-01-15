#!/bin/bash

# DriftLog Database Reset Script
# This script removes the SQLite database to force a clean rebuild on next app launch

echo "🔄 Resetting DriftLog database..."

# Find and remove the database file from the device/simulator
# The actual location depends on where Expo SQLite stores it

# For development, remove the local db file if it exists
if [ -f "driftlog.db" ]; then
  rm driftlog.db
  echo "✅ Removed local database file"
fi

# For iOS Simulator, we need to clear the app data
echo "⚠️  To fully reset the database on iOS Simulator:"
echo "   1. Stop the app"
echo "   2. Delete the app from the simulator"
echo "   3. Restart the app"
echo ""
echo "⚠️  To fully reset the database on Android Emulator:"
echo "   1. Stop the app"
echo "   2. Settings → Apps → DriftLog → Storage → Clear Data"
echo "   3. Restart the app"
echo ""
echo "✅ Database reset initiated. Restart your app to rebuild the schema."
