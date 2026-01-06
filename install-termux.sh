#!/data/data/com.termux/files/usr/bin/bash

# Gemini Router - Termux Installer
# This script installs the Gemini API Key Router and its dependencies

echo "🚀 Starting Gemini Router Installation..."

# 1. Update and install core dependencies
echo "📦 Updating packages..."
pkg update -y && pkg upgrade -y
pkg install -y nodejs git python make g++

# 2. Setup project directory
echo "📂 Setting up project directory..."
mkdir -p ~/gemini-router
cd ~/gemini-router

# 3. Initialize project
echo "🛠️ Initializing environment..."
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json <<EOF
{
  "name": "gemini-router-termux",
  "version": "1.0.0",
  "description": "Professional Gemini API Key Router",
  "main": "index.js",
  "scripts": {
    "start": "vite --host 0.0.0.0",
    "build": "vite build"
  },
  "dependencies": {}
}
EOF
fi

# 4. Install production dependencies
echo "📥 Installing production modules..."
npm install vite @vitejs/plugin-react react react-dom wouter lucide-react framer-motion clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-select @radix-ui/react-progress @radix-ui/react-toast lucide-react next-themes

# 5. Instructions for sync
echo ""
echo "✅ Installation complete!"
echo "--------------------------------------------------"
echo "To start the router locally in Termux:"
echo "1. Navigate to the project: cd ~/gemini-router"
echo "2. Run the development server: npm run start"
echo "3. Access the GUI at: http://localhost:5173"
echo "--------------------------------------------------"
echo "Note: For a full sync of the existing UI files, copy your 'client/src' "
echo "directory into '~/gemini-router/src' on your Termux device."
