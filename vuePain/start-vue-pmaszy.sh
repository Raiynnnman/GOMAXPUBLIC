#!/bin/sh

export PORT=3003
REACT_APP_API_BASE_URL="http://localhost:8001" npm run dev -- --port $PORT
