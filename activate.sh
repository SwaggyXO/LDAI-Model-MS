#!/bin/bash
echo "Executing activate.sh script..."

# Source the virtual environment activation script
. model-ms-env/bin/activate

# Check if the virtual environment is activated
if [ -n "$VIRTUAL_ENV" ]; then
    echo "Virtual environment activated successfully. Path: $VIRTUAL_ENV"
else
    echo "Failed to activate virtual environment."
fi

# Start the server
npm run start