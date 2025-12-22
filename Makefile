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

.PHONY: all md pdf clean
md: build/resume.md

pdf: build/resume.pdf

clean:
	rm -rf build/*.md build/*.typ build/*.pdf
