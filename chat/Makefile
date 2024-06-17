
BP=$(shell find blueprint/ -type f -name '*.py')
FILES=server.py $(wildcard */*.py)
.PHONY: version tests all build $(FILES) feeds compile middlestep copypre 

all : virtualenv version install

build: virtualenv version compile copypre

virtualenv: version
	if [ ! -d node_modules ]; then npm i; fi

version:
	bash ../mkversion.sh

install: build 
	rm -rf targets
	mkdir -p targets bin
	cp -r bin pre
	cp -r config pre
	cp -r package.json pre
	if [ -f version.sh ]; then cp version.sh pre; fi
	if [ -d bin ]; then cp -r bin pre; rm -f pre/bin/dev*; fi
	(cd pre && tar cfz ../targets/install.tar.gz  --exclude p \
		--exclude targets \
        --exclude ui/src --exclude .git --exclude src \
        --exclude node_modules \
		.)
	mkdir -p targets/package
	(cd pre && ln -s server.js worker.js)
	echo '#!/bin/bash' > targets/package/install.sh
	cat ../backend/scripts/install.sh >> targets/package/install.sh
	cp targets/install.tar.gz targets/package/
	(cd targets && tar cfz fullinstall.tar.gz package)

compile:

copypre:
	rm -rf pre
	mkdir -p pre
	echo "----"
	find . -type  f -name '*.js' | grep -v node_modules | \
		cpio -pdv pre
	if [ -d pre/pre ]; then rm -rf pre/pre; fi

tests:
