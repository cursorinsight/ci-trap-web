#-------------------------------------------------------------------------------
# Copyright (C) 2021- Cursor Insight
#
# All rights reserved.
#-------------------------------------------------------------------------------

include $(dir $(firstword $(MAKEFILE_LIST)))/../../Makefile.common

# Set up necessary tools
$(eval $(call set-up-tools-template,NPM,npm))
$(eval $(call set-up-tools-template,NPX,npx))

#-------------------------------------------------------------------------------
# Targets
#-------------------------------------------------------------------------------

.PHONY: default
default: install-deps

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
server: $(NPM)
	$(NPM) run serve
