all:
	pug . --out .cache --hierarchy --pretty -b . -O "require('`pwd`/config.js')" -w
