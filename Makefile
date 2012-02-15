#
# Makefile for keg-server
#

all: create.dir

install.dep:
	npm install

create.dir: install.dep
	mkdir -p db
	mkdir -p logs

recreate.db: create.dir
	node setup/recreate-db-sqlite3.js
