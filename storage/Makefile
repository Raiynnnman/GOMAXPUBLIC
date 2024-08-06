
TESTS=$(shell find tests/ -type f -name '*.py')
BP=$(shell find blueprint/ -type f -name '*.py')
FILES=server.py $(wildcard */*.py)
.PHONY: version all build $(FILES) feeds compile middlestep copypre celery-script

all : virtualenv version

celery-script:
	echo "#!/bin/sh" > bin/launch-celery.sh
	grep app.task */*.py | awk -F: '{ print $$1 }' | \
		uniq | sed -e 's/\.py/,/g' -e 's/\//\./g' -e 's/,$$//g' > celtemp
	for x in `cat celtemp`; do T="$$T,$$x"; done; echo $$T > celtemp2
	cat celtemp2 | sed -e 's/^,//g' -e 's/,$$//g' > celtemp3
	echo "I=\"`cat celtemp3`\"" >> bin/launch-celery.sh
	cat bin/launch-celery-template.sh >> bin/launch-celery.sh
	rm -f celtemp celtemp2 celtemp3


build: virtualenv version celery-script compile copypre

virtualenv: version
	if [ ! -d p ]; then \
		python3 -m venv p; \
		. p/bin/activate && pip3 install -r requirements.txt; \
	fi


version:
	bash scripts/mkversion.sh

install: build 
	rm -rf targets
	mkdir -p targets bin
	cp -r bin pre
	cp -r sql pre
	cp -r processing/javascript pre/processing
	cp -r tests pre 
	if [ -f requirements.txt ]; then cp requirements.txt pre; fi
	if [ -f .celery-process ]; then touch pre/.celery-process; fi
	if [ -d pre/pre ]; then rm -rf pre/pre; fi
	if [ -d rest/roles ] ; then cp -r rest/roles pre/rest ; fi
	if [ -d templates ] ; then cp -r templates pre ; fi
	if [ -f version.sh ]; then cp version.sh pre; fi
	if [ -d bin ]; then cp -r bin pre; rm -f pre/bin/dev*; fi
	if [ -f pre/bin/launch-celery-template.sh ]; then rm pre/bin/launch-celery-template.sh; fi
	if [ -d docs ]; then cp -r docs pre; fi
	(cd pre && tar cfz ../targets/install.tar.gz  --exclude p \
		--exclude targets \
        --exclude ui/src --exclude .git --exclude src \
        --exclude node_modules \
		.)
	mkdir -p targets/package
	echo '#!/bin/bash' > targets/package/install.sh
	cat ./scripts/install.sh >> targets/package/install.sh
	cp targets/install.tar.gz targets/package/
	(cd targets && tar cfz fullinstall.tar.gz package)

compile:
	(source p/bin/activate || . p/bin/activate; \
        find . -name '*.py' | grep -v '^\.\/p/' \
        | xargs python -m compileall -f )

copypre:
	rm -rf pre
	mkdir -p pre
	find . -type f | grep __pycache__ | grep -v '^\.\/p/' | cpio -pdv pre
	echo "----"
	find pre -type  f -name '*.pyc' | grep -v '/\./p/' | \
		xargs bash -x ./scripts/preprocess-python.sh
	if [ -d pre/pre ]; then rm -rf pre/pre; fi
