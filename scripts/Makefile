
BP=$(shell find blueprint/ -type f -name '*.py')
FILES=server.py $(wildcard */*.py)
.PHONY: version tests all build $(FILES) feeds compile middlestep copypre 

all : virtualenv version install

build: virtualenv version compile copypre

virtualenv: version
	if [ ! -d p ]; then \
		python3 -m venv p; \
		. p/bin/activate && pip3 install -r requirements.txt; \
	fi


version:
	bash ../mkversion.sh

install: build 
	rm -rf targets
	mkdir -p targets bin
	cp -r bin pre
	if [ -f requirements.txt ]; then cp requirements.txt pre; fi
	if [ -d pre/pre ]; then rm -rf pre/pre; fi
	if [ -d rest/roles ] ; then cp -r rest/roles pre/rest ; fi
	if [ -f version.sh ]; then cp version.sh pre; fi
	if [ -f ../version ]; then cp ../version pre; fi
	if [ -d bin ]; then cp -r bin pre; rm -f pre/bin/dev*; fi
	if [ -d docs ]; then cp -r docs pre; fi
	cp stripe/doall.sh pre/stripe
	cp office/doall.sh pre/office
	cp data_import/doall.sh pre/data_import
	cp -r ../backend/templates pre/
	mkdir -p pre/tests/storage
	cp -r tests/ pre/tests
	cp -r tests/*.sh pre/tests
	cp -r tests/storage/*.sh pre/tests/storage
	cp -r tests/storage/*.json pre/tests/storage
	if [ -d p ]; then cp -r p pre; fi
	(cd pre && tar cfz ../targets/install.tar.gz  --exclude p \
		--exclude targets \
        --exclude ui/src --exclude .git --exclude src \
        --exclude node_modules \
		.)
	mkdir -p targets/package
	echo '#!/bin/bash' > targets/package/install.sh
	cat ../backend/scripts/install.sh >> targets/package/install.sh
	cp targets/install.tar.gz targets/package/
	(cd targets && tar cfz fullinstall.tar.gz package)

compile:
	(source p/bin/activate || . p/bin/activate; \
		find . -name *.py | grep -v '^\.\/p\/' | grep -v '^\.\/pre\/p\/' \
        | xargs python -m compileall -f )

copypre:
	mkdir __pycache__
	rm -rf pre
	mkdir -p pre
	find . -type f | grep __pycache__ | grep -v '^\.\/p/' | cpio -pdv pre
	echo "----"
	find pre -type  f -name '*.pyc' | grep -v '/\./p/' | \
		xargs bash ../backend/scripts/preprocess-python.sh
	if [ -d pre/pre ]; then rm -rf pre/pre; fi

tests:
