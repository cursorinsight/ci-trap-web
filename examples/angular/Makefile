#-------------------------------------------------------------------------------
# Copyright (C) 2022- Cursor Insight
#
# All rights reserved.
#-------------------------------------------------------------------------------

include $(dir $(firstword $(MAKEFILE_LIST)))/../../Makefile.common

# Set up necessary tools
$(eval $(call set-up-tools-template,NPM,npm))
$(eval $(call set-up-tools-template,NPX,npx))

# Imported IIFE trap module and its source
TRAP_ABS_DIR := $(abspath $(ABS_DIR)/../..)
TRAP_SOURCE_PATH := $(TRAP_ABS_DIR)/src/trap.js
TRAP_DIST_PATH := $(TRAP_ABS_DIR)/dist/trap-iife.min.js

#-------------------------------------------------------------------------------
# Targets
#-------------------------------------------------------------------------------

.PHONY: default
default: install-deps

# Create a fresh release when necessary
$(TRAP_DIST_PATH): $(TRAP_SOURCE_PATH)
	$(MAKE) -C $(TRAP_ABS_DIR) release

# Install dependencies
.PHONY: install-deps
install-deps: $(NPM)
	$(NPM) install

# Upgrade dependencies
.PHONY: upgrade-deps
upgrade-deps: $(NPX)
	$(NPX) npm-check-updates -u

# Run dev server
.PHONY: server
server: $(NPM) $(TRAP_DIST_PATH)
	$(NPM) start
