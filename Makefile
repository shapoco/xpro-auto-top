.PHONY: update deploy test

TEST_PORT = 9876

APP_NAME = xpro-auto-top
USER_JS = $(APP_NAME).user.js
DIST_URL = "https://github.com/shapoco/$(APP_NAME)/raw/refs/heads/main/dist/"

BIN_DIR = $(shell pwd)/bin
SRC_DIR = src
DIST_DIR = dist

update:
	$(BIN_DIR)/increment_revision.py -f "$(SRC_DIR)/$(USER_JS)"

deploy: update
	mkdir -p dist
	cp -f "$(SRC_DIR)/$(USER_JS)" "$(DIST_DIR)/."
	sed -i "$(DIST_DIR)/$(USER_JS)" -e "s#http://localhost:9876/#$(DIST_URL)#g"
	sed -i "$(DIST_DIR)/$(USER_JS)" -e "s# (Debug)##g"
	sed -i "$(DIST_DIR)/$(USER_JS)" -e "s#const DEBUG_MODE = true;#const DEBUG_MODE = false;#g"

test:
	python3 -m http.server -d "$(SRC_DIR)" "$(TEST_PORT)"
