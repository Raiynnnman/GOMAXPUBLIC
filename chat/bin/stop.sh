#!/bin/bash

export port=8081
export PM2_PORT=8081
pm2 stop worker
pm2 delete all
