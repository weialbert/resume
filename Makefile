PY ?= python3
RENDER := $(PY) scripts/render.py
PROFILE ?= onepage
DATA_FILE ?= data/data.yaml

all: md html pdf index

build/resume.md: $(DATA_FILE) templates/resume.md.tmpl scripts/render.py
	$(RENDER) --format md --output $@

build/resume.html: $(DATA_FILE) templates/resume.html.tmpl scripts/render.py
	$(RENDER) --format html --output $@

build/index.html: templates/index.html.tmpl
	cp templates/index.html.tmpl build/index.html

build/resume.typ: $(DATA_FILE) templates/resume.typ.tmpl scripts/render.py
	$(RENDER) --profile $(PROFILE) --format typst --output $@

build/resume.pdf: build/resume.typ
	typst compile $< build/resume.pdf

.PHONY: all setup md html pdf index clean watch

.setup-done:
	uv sync
	@touch .setup-done

setup: .setup-done

md: setup build/resume.md

html: setup build/resume.html

index: build/index.html

check:
	@scripts/check_outputs.sh

pdf: setup build/resume.pdf

clean:
	rm -rf build/*.md build/*.html build/*.typ build/*.pdf .setup-done

watch:
	while true; do $(MAKE) -q || $(MAKE); sleep 0.5; done