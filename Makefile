#
# Makefile for keg-server
#

all: create.db

install.dep:
	npm install

create.db: install.dep
	mkdir -p db
	node setup/createdb.js
