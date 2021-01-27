#-------------------------------------------------------------------------------
# Copyright (C) 2020- Cursor Insight
#
# All rights reserved.
#-------------------------------------------------------------------------------

include $(dir $(firstword $(MAKEFILE_LIST)))/Makefile.common

# NPM extra arguments (optional), e.g., "--prefer-offline"
NPM_EXTRA_ARGS ?=

# Set up necessary tools
$(eval $(call set-up-tools-template,FIND,find))
$(eval $(call set-up-tools-template,NPM,npm))

#-------------------------------------------------------------------------------
# Internals
#-------------------------------------------------------------------------------

# Common variables
SOURCE_FILES := $(shell $(FIND) $(TOP_DIR)/src/ -name '*.js')
ESLINT_JSON_REPORT := $(TOP_DIR)/eslint-report.json

# NPM arguments
NPM_ARGS := $(NPM_EXTRA_ARGS)

# NPM relies on adding local dependencies to `./node_modules` so this is not
# configurable here.
MODULES_DIR := $(ABS_DIR)/node_modules

#-------------------------------------------------------------------------------
# Targets
#-------------------------------------------------------------------------------

default: install-deps compile check test

.PHONY: mrproper
#: Full cleanup
mrproper:
	$(RM) -r $(MODULES_DIR)

.PHONY: install-deps
#: Install dependencies
install-deps: $(NPM)
	$(NPM) $(NPM_ARGS) install

.PHONY: upgrade-deps
#: Upgrade dependencies
upgrade-deps: $(NPM)
	$(NPM) $(NPM_ARGS) exec -- npm-check-updates -u

.PHONY: upgrade-browserslist
#: Upgrade browserslist
upgrade-browserslist: $(NPM)
	$(NPM) $(NPM_ARGS) exec -- browserslist@latest --update-db

.PHONY: check
#: Run code checks with ESLint
check: $(NPM)
	$(NPM) $(NPM_ARGS) run eslint

.PHONY: fix
#: Fix code issues with ESLint automagically
fix: $(NPM)
	$(NPM) $(NPM_ARGS) run eslint:fix

.PHONY: check-json
#: Execute ESLint and write results to `eslint-report.json`
check-json: $(ESLINT_JSON_REPORT)
$(ESLINT_JSON_REPORT): $(SOURCE_FILES)
	$(NPM) $(NPM_ARGS) run eslint:json

.PHONY: test
#: Run tests
test: $(NPM)
	$(NPM) $(NPM_ARGS) test

.PHONY: build compile
#: Compile the code for development (once)
build: compile
compile: $(NPM) $(SOURCE_FILES)
	$(NPM) $(NPM_ARGS) run build:dev

.PHONY: server watch
server: watch
#: Run automatic compile loop
watch: $(NPM)
	$(NPM) $(NPM_ARGS) run watch

.PHONY: release
#: Make release
release: $(NPM) $(SOURCE_FILES)
	$(NPM) $(NPM_ARGS) run build:prod
