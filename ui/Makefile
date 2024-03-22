
.PHONY: version all build


all: version build

version:
	bash ../mkversion.sh

build: version
	rm -rf build
	cp src/globalConfig.js.prod src/globalConfig.js
	cp src/cryptoKey.js.prod src/cryptoKey.js
	cp src/salesforceConfig.js.prod src/salesforceConfig.js
	cp src/baseURLConfig.js.prod src/baseURLConfig.js
	cp src/squareConfig.js.prod src/squareConfig.js
	npm i
	npm run build
	cp src/version.js.dev src/version.js

install: build
	mkdir -p targets/package
	touch build/.front-ui
	(cd build && tar cfz ../targets/package/install.tar.gz .)
	echo '#!/bin/bash' > targets/package/install.sh
	cat ../version >> targets/package/install.sh
	cat ../backend/scripts/install.sh >> targets/package/install.sh
	cp ../version targets/package
	(cd targets && tar cfz fullinstall.tar.gz package)

