


virtualenv: version
	if [ ! -d p ]; then \
		python3 -m venv p; \
		. p/bin/activate && pip3 install -r requirements.txt; \
	fi

translation:
	bash ../scripts/translations.sh

translationui:
	bash ../scripts/translationsui.sh

version:
	bash ../scripts/mkversion.sh
	bash ../scripts/generate_change.sh

clean:
	rm -rf p
	rm -rf targets depot
	rm -f templates/js/version.js common/version.py 
	rm -rf templates/WIN/node_modules templates/node_modules
	rm -f common/version.pyc

pylint:
	-@if [ -x p/bin/pylint ]; then \
	    /bin/true p/bin/pylint $(FILES) ; \
	else \
	    /bin/true pylint $(FILES) ; fi

$(FILES):
	@echo CodeStyle: $@
	@if [ -x p/bin/prospector ]; then \
		if [ -f .tests-srsly ]; then \
			/bin/true p/bin/prospector $@ ; \
		else \
			/bin/true p/bin/prospector $@ || exit 0; \
		fi; \
	else \
		if [ -f .tests-srsly ]; then \
			/bin/true p/bin/prospector $@ ; \
		else \
			/bin/true p/bin/prospector $@ || exit 0; \
		fi; \
    fi;
	@echo Testing: $@
	@/bin/true p/bin/python -m unittest $@ -v -f

common/translations.py:
	echo "skipping generated file"

common/i18nExceptions.py:
	echo "skipping generated file"

tests: translation $(FILES)

docs: version
	@if [ -x p/bin/sphinx-build ]; then \
        p/bin/sphinx-apidoc -o templates/docs . ; \
	    p/bin/sphinx-build -E -a -b html . templates/docs; \
	else \
        sphinx-apidoc -o templates/docs . ;\
		sphinx-build -E -a -b html . templates/docs; \
	fi

install-docs:
	if [ -f targets/docs.tar.gz ]; then tar xfv targets/docs.tar.gz; fi

install: build install-docs
	rm -rf targets
	mkdir -p targets bin
	cp ../version.sh ../version.ini .
	if [ -f requirements.txt ]; then cp requirements.txt pre; fi
	if [ -f .celery-process ]; then touch pre/.celery-process; fi
	if [ -d pre/pre ]; then rm -rf pre/pre; fi
	if [ -d rest/roles ] ; then cp -r rest/roles pre/rest ; fi
	if [ -d handlers/data ] ; then cp -r handlers/data pre/handlers; fi
	if [ -d templates ] ; then cp -r templates pre ; fi
	if [ -d handlers/javascript ] ; then cp -r handlers/javascript pre/handlers; fi
	if [ -f version.sh ]; then cp version.sh pre; fi
	if [ -d bin ]; then cp -r bin pre; rm -f pre/bin/dev*; fi
	if [ -d docs ]; then cp -r docs pre; fi
	(cd pre && tar cfz ../targets/install.tar.gz  --exclude p \
		--exclude targets \
        --exclude ui/src --exclude .git --exclude src \
        --exclude node_modules \
		.)
	mkdir -p targets/package
	echo '#!/bin/bash' > targets/package/install.sh
	cat ../version >> targets/package/install.sh
	cat ../scripts/install.sh >> targets/package/install.sh
	cp ../version targets/package
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
		xargs bash -x ../scripts/preprocess-python.sh
	if [ -d pre/pre ]; then rm -rf pre/pre; fi
