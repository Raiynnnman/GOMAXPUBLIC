
SHELL=/bin/bash
D=backend scripts torres chat
    

.PHONY: all $D save all-tests

all: deploy

build: $D

$D:
	(cd $@ && make install)

upload-masterinstall: gen-masterinstall
	# bash -x scripts/s3upload.sh `find depot -name master*`

save:
	mkdir -p save/configs/$(USER)
	ls */settings.cfg  | grep -v save | cpio -pdv save/configs/$(USER)

deploy: build 
	mkdir deploy
	for x in $D; do \
	    mkdir -p deploy/$$x; \
	    cp $$x/targets/fullinstall.tar.gz deploy/$$x; done


all-tests:
	for x in $(D); do (cd $$x && make tests); done
    

include common.mk

