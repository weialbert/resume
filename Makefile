PY ?= python
RENDER := $(PY) scripts/render.py
PROFILE ?= onepage

all: md pdf

build/resume.md: data/experience.yaml templates/resume.md.tmpl scripts/render.py
	$(RENDER) --format md --output $@

build/resume.typ: data/experience.yaml templates/resume.typ.tmpl scripts/render.py
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
	@echo "Ensuring Python deps (PyYAML, Jinja2) are installed to user site"
	$(PY) -m pip install --user PyYAML Jinja2

md: setup build/resume.md

pdf: setup build/resume.pdf

clean:
	rm -rf build/*.md build/*.typ build/*.pdf
