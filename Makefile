DEST=.wapp

all:
	pug . --out .cache --hierarchy --pretty -b .
	mkdir -p $(DEST)
	for f in cdn img js main.js; do cp -r "$$f" $(DEST)/; done
	for f in .cache/index.html .cache/api.html; do cp -r "$$f" $(DEST)/; done
	find components/ -name "*.js" -exec cp --parents {} $(DEST)/ \;

clean:
	rm -rf .cache
	rm -rf .wapp
