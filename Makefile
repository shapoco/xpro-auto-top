.PHONY: test deploy

TEST_PORT = 9876

JS_NAME = xpro-auto-top.user.js

SRC_DIR = src
DIST_DIR = dist

# todo: delete docs/
DOCS_DIR = docs

test:
	python3 -m http.server -d "$(SRC_DIR)" "$(TEST_PORT)"

deploy:
	./bin/increment_revision.py -f "$(SRC_DIR)/$(JS_NAME)"
	mkdir -p dist
	cp -f "$(SRC_DIR)/$(JS_NAME)" "$(DIST_DIR)/."
	sed -i "$(DIST_DIR)/$(JS_NAME)" -e "s#http://localhost:9876/#https://github.com/shapoco/xpro-auto-top/raw/refs/heads/main/dist/#g"

	# todo: delete docs/
	mkdir -p "$(DOCS_DIR)"
	cp -f "$(DIST_DIR)/$(JS_NAME)" "$(DOCS_DIR)/."

	git status
	#git add .
	#git commit -m "deploy"
	#git push

