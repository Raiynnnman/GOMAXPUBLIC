#!/bin/sh

export NODE_OPTIONS=--openssl-legacy-provider
export PORT=3001
REACT_APP_API_BASE_URL="http://localhost:8001" npm start 
