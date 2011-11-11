#
# Makefile for keg-server
#

all: create.db

install.dep:
	npm install

create.db: install.dep
	node setup/createdb.js