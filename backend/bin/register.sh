#!/bin/sh

ID=`wget -q -O - http://169.254.169.254/latest/meta-data/instance-id`
export AWS_ACCESS_KEY_ID='AKIAZI2LFG5UE3I7WQNH'
export AWS_SECRET_ACCESS_KEY='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'
export ARN='arn:aws:elasticloadbalancing:us-east-1:637423400808:targetgroup/PROD-WEB/c456ace46bf86231'

aws elbv2 --region us-east-1 register-targets --target-group-arn $ARN --targets="Id=$ID,Port=80"
