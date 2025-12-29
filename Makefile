PY ?= python3
RENDER := $(PY) scripts/render.py
PROFILE ?= onepage
DATA_FILE ?= data/data.yaml

all: md pdf

build/resume.md: $(DATA_FILE) templates/resume.md.tmpl scripts/render.py
	$(RENDER) --format md --output $@

build/resume.typ: $(DATA_FILE) templates/resume.typ.tmpl scripts/render.py
	$(RENDER) --profile $(PROFILE) --format typst --output $@

build/resume.pdf: build/resume.typ
	typst compile $< build/resume.pdf

.PHONY: all setup md pdf clean

.setup-done:
	uv sync
	@touch .setup-done

setup: .setup-done

md: setup build/resume.md

pdf: setup build/resume.pdf

clean:
	rm -rf build/*.md build/*.typ build/*.pdf .setup-done

.PHONY: watch
watch:
	while true; do $(MAKE) -q || $(MAKE); sleep 0.5; done