#!/bin/bash
echo "Executing activate_local.sh script..."

# Source the virtual environment activation script
source model-ms-env/Scripts/activate

# Check if the virtual environment is activated
if [ -n "$VIRTUAL_ENV" ]; then
    echo "Virtual environment activated successfully. Path: $VIRTUAL_ENV"
else
    echo "Failed to activate virtual environment."
fi

# Function to deactivate virtual environment
deactivate_venv() {
    echo "Deactivating virtual environment..."
    deactivate
    echo "Virtual environment deactivated."
}

# Trap SIGINT (Ctrl+C) and SIGTERM signals to call the deactivate_venv function
trap deactivate_venv SIGINT SIGTERM

# Start the server
npm run dev
