#!/bin/sh

(
cat << EOF
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true" />
</network-security-config>
EOF
) > platforms/android/app/src/main/res/xml/network_security_config.xml
