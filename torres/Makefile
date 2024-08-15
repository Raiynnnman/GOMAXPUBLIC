
.PHONY: version all build


all: version build

version:
	bash ../mkversion.sh

build: version
	rm -rf build
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
	cp ../meta.cfg targets/package
	cp ../version targets/package
	(cd targets && tar cfz fullinstall.tar.gz package)

