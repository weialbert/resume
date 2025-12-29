PY ?= python
RENDER := $(PY) scripts/render.py
PROFILE ?= onepage
DATA_FILE ?= data/data.yaml

all: md pdf

build/resume.md: $(DATA_FILE) templates/resume.md.tmpl scripts/render.py
	$(RENDER) --format md --output $@

build/resume.typ: $(DATA_FILE) templates/resume.typ.tmpl scripts/render.py
	$(RENDER) --profile $(PROFILE) --format typst --output $@

# Build a PDF from Typst and ensure letter paper size using Ghostscript
build/resume.pdf: build/resume.typ
	@echo "Compiling Typst -> intermediate PDF"
	typst compile $< build/resume-raw.pdf
	@echo "Converting to Letter (Ghostscript) -> $@"
	gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/prepress -sPAPERSIZE=letter -dFIXEDMEDIA -dPDFFitPage -sOutputFile=$@ build/resume-raw.pdf
	@rm -f build/resume-raw.pdf

.PHONY: all setup md pdf clean

setup:
	@if command -v uv >/dev/null 2>&1; then \
		uv sync; \
	else \
		echo "uv not found — installing with pip to user site"; \
		$(PY) -m pip install --user PyYAML Jinja2; \
	fi

md: setup build/resume.md

pdf: setup build/resume.pdf

clean:
	rm -rf build/*.md build/*.typ build/*.pdf

.PHONY: watch
watch:
	@echo "Watching source directories for changes and rebuilding on change (requires watchexec, fswatch, or entr)"
	@if command -v watchexec >/dev/null 2>&1; then \
		watchexec -r -w data -w templates -w scripts -w archive -w Makefile -- uv run make; \
	elif command -v fswatch >/dev/null 2>&1; then \
		fswatch -o data templates scripts archive Makefile | xargs -n1 -I{} uv run make; \
	elif command -v entr >/dev/null 2>&1; then \
		find data templates scripts archive Makefile | entr -c uv run make; \
	else \
		echo "Install watchexec (recommended), fswatch, or entr to use 'make watch'"; \
	fi
