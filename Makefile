.PHONY: test

TEST_PORT = 9876

test:
	python3 -m http.server -d docs "$(TEST_PORT)"
