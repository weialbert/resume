TEXFILE = resume

# Default rule
all: $(TEXFILE).pdf clean

# Compile the PDF
$(TEXFILE).pdf: $(TEXFILE).tex
	pdflatex --shell-escape $(TEXFILE).tex

# Clean auxiliary files
clean:
	rm -f *.aux *.log *.out *.toc *.lof *.lot
