# Grub Blasters — dev tasks (Termux-first, no dependencies)
REPO       ?= Mark44928/GrubBlastersHTML
URL        ?= https://mark44928.github.io/GrubBlastersHTML/
PORT       ?= 8080
BUILD_WAIT ?= 45
TMPDIR     ?= /data/data/com.termux/files/usr/tmp
GBJS       := $(TMPDIR)/gb.js

# Termux has no /bin/sh; use $PREFIX/bin/sh when PREFIX is present.
ifneq ($(wildcard $(PREFIX)/bin/sh),)
SHELL := $(PREFIX)/bin/sh
endif

.DEFAULT_GOAL := help
.PHONY: help check syntax size sync-size serve open status verify publish clean

help:
	@echo "Grub Blasters targets:"
	@echo "  make check                syntax check + README size sync"
	@echo "  make syntax               JS syntax check only"
	@echo "  make size                 report file size vs README"
	@echo "  make sync-size            update README 'About N KB'"
	@echo "  make serve [PORT=8080]    local preview server"
	@echo "  make open                 open the live game"
	@echo "  make status               Pages build + live HTTP status"
	@echo "  make verify               wait $(BUILD_WAIT)s, then status"
	@echo "  make publish MSG=\"...\"     check, commit, push, verify"
	@echo "  make clean                remove temp files"

$(GBJS): index.html
	@mkdir -p "$(TMPDIR)"
	@node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const m=h.match(/<script>([\s\S]*)<\/script>/);if(!m)throw new Error('no script block found');fs.writeFileSync('$(GBJS)',m[1])"

syntax: $(GBJS)
	@node --check "$(GBJS)"
	@echo "SYNTAX OK"

size:
	@wc -c < index.html | awk '{printf "index.html: %d bytes (%.1f KB)\n", $$1, $$1/1024}'
	@awk '/About [0-9]+ KB/{print "README:     " $$0}' README.md

check: syntax
	@sz=$$(wc -c < index.html | awk '{printf "%.0f", $$1/1024}'); rm=$$(grep -o 'About [0-9]* KB' README.md | grep -o '[0-9]*'); if [ "$$sz" != "$$rm" ]; then echo "SIZE MISMATCH: index.html is ~$$sz KB, README says ~$$rm KB - run 'make sync-size'"; exit 1; fi; echo "SIZE SYNC OK (~$$sz KB)"

sync-size:
	@sz=$$(wc -c < index.html | awk '{printf "%.0f", $$1/1024}'); awk -v kb="$$sz" '{sub(/About [0-9]+ KB/, "About " kb " KB")}1' README.md > "$(TMPDIR)/README.tmp" && mv "$(TMPDIR)/README.tmp" README.md; echo "README updated: About $$sz KB"

serve:
	@echo "Serving at http://localhost:$(PORT)/  (Ctrl-C stops)"
	@python3 -m http.server $(PORT)

open:
	@command -v termux-open >/dev/null 2>&1 && termux-open "$(URL)" || echo "$(URL)"

status:
	@gh api repos/$(REPO)/pages/builds/latest --jq '{status, error}'
	@curl -s -o /dev/null -w "live: %{http_code}\n" "$(URL)"

verify:
	@echo "Waiting $(BUILD_WAIT)s for GitHub Pages..."
	@sleep $(BUILD_WAIT)
	@$(MAKE) status --no-print-directory

publish: check
	@test -n "$(MSG)" || { echo 'usage: make publish MSG="commit message"'; exit 1; }
	git add -A
	git commit -m "$(MSG)"
	git push
	@$(MAKE) verify --no-print-directory

clean:
	@rm -f "$(GBJS)" "$(TMPDIR)/README.tmp"
