#!/bin/bash

export port=8081
export PM2_PORT=8081
pm2 stop worker
pm2 delete all
if [ -f $HOME/.pm2/pm2.log ]; then
    gzip $HOME/.pm2/pm2.log
    mv $HOME/.pm2/pm2.log.gz $HOME/.pm2/pm2.log.`date +"%Y%m%d%H%M"`.gz
fi
