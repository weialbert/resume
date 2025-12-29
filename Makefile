PY ?= python3
RENDER := $(PY) src/render.py
PROFILE ?= onepage
DATA_FILE ?= data/data.yaml

all: md html pdf index

build/resume.md: $(DATA_FILE) templates/resume.md.j2 src/render.py
	$(RENDER) --format md --output $@

build/resume.html: $(DATA_FILE) templates/resume.html.j2 src/render.py
	$(RENDER) --format html --output $@

build/index.html: $(DATA_FILE) templates/index.html.j2 src/render.py
	$(RENDER) --format index --output $@

build/resume.typ: $(DATA_FILE) templates/resume.typ.j2 src/render.py
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

index: setup build/index.html

check:
	@checks/check_outputs.sh

pdf: setup build/resume.pdf

clean:
	rm -rf build/*.md build/*.html build/*.typ build/*.pdf .setup-done resume.egg-info

watch:
	while true; do $(MAKE) -q || $(MAKE); sleep 0.5; done