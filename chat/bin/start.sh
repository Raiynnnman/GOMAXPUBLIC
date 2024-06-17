#!/bin/sh

export port=8081
export PM2_PORT=8081
pm2 start ecosystem.config.js $*
