
.PHONY: run copy version tests all build 


all: run-android

nobuild: 
	cordova run android --nobuild

run-ios: copy
	cordova run ios

run-android: copy
	rm -rf platforms/android/app/src/main/java/com/dhd
	mkdir -p platforms/android/app/src/main/java/com/dhd
	cp -r platforms/android/app/src/main/java/io/cordova/* \
		platforms/android/app/src/main/java/com/dhd
	mv platforms/android/app/src/main/java/com/dhd/hellocordova \
		platforms/android/app/src/main/java/com/dhd/mobile
	cp platforms/android/app/src/main/java/com/dhd/mobile/MainActivity.java \
		platforms/android/app/src/main/java/com/dhd/mobile/MainActivity.java2
	cat  platforms/android/app/src/main/java/com/dhd/mobile/MainActivity.java2 | \
		sed 's/package io.cordova.hellocordova;/package com.dhd.mobile;/g' > \
		platforms/android/app/src/main/java/com/dhd/mobile/MainActivity.java
	rm -rf www/static www/pre*.js
	bash scripts/addnetwork.sh
	cordova run android
	mkdir -p targets
	if [ -f platforms/android/app/build/outputs/apk/debug/app-debug.apk ]; then \
		cp platforms/android/app/build/outputs/apk/debug/app-debug.apk targets; \
	fi

install:
	bash scripts/addnetwork.sh
	cp public/index-mobile.html public/index.html
	cp src/index-mobile.js src/index.js
	cp src/globalConfig-mobile.js.prod src/globalConfig.js

copy:
	mkdir -p public src
	rsync -avz ../ui/public ../ui/src .
	cp public/index-mobile.html public/index.html
	cp src/index-mobile.js src/index.js
	cp src/globalConfig-mobile.js src/globalConfig.js

version:
	bash ../mkversion.sh
	
init: version
	rm -rf src public
	cp -r ../ui/src ../ui/public .
	npm i

