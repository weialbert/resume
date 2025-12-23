# Resume

This repository builds resumes from a single [data](data/data.yaml) file using Typst and templates for different file outputs, hosted with github pages and tested using CI with github actions.

> [!NOTE]
> The final resume is hosted through github pages at [weialbert.github.io/resume/](weialbert.github.io/resume/)

The resume homepage contains data formatted for several different outputs:
| Format | Description|
| --- | ---| 
| `pdf` | A **one-page** summary ready for download and file submission purposes|
| `html`| An extended resume containing all information for quick **copying utility**, helpful for filling in application boxes |
| `markdown` | Extended source code for reference use| 

## Quick start

### Prerequisites:
- Python 3.11+ (or system Python)
- typst (https://typst.org) or installable via Rust/Cargo

### Install Python deps:

```bash
# Install uv (recommended) and sync dependencies from pyproject.toml
python -m pip install --user uv
uv sync
```

### Build (all):

```bash
uv run make
```

### Build only markdown or PDF:

```bash
uv run make md
uv run make pdf
```

### Watch for changes

```bash
# Rebuild automatically when templates, data, or scripts change
# Requires a watcher: install watchexec (recommended)
make watch
# or
uv run make watch
```

## Making changes

### Adding data
Updating or inserting data points into the resume can be easily made by modifying the [data](data/data.yaml) file. The following sections can be altered:
| Section | Description |
| --- | --- |
|`profiles`| Set profiles for each output type.git  The PDF output uses the `onepage` profile which filters bullet points for each experience by `tag` and `importanace` labels, alongside a `max_bullets` amount| 
|`personal`| Add details such as name, email, location, github, social media accounts|
|`education`| Add relevant degrees, institutions, graduation dates, GPA, and academic awards|
|`experience`| Add professional experience including job titles, companies, dates, and key responsibilities or achievements|
|`publications`| Add published papers, articles, blog posts, or research work with titles, venues, and dates|
|`leadership`| Add leadership roles, organizations, dates, and examples of impact or responsibilities|
|`projects`| Add notable personal, academic, or professional projects with brief descriptions and technologies used|
|`skills`| Add technical skills, tools, programming languages, frameworks, and relevant soft skills|

## CI checks
Every time changes are pushed, workflows in the `.github/workflows/` are automatically deployed. These ensure:
    
1. Outputs build successfully. CI checks will fail if the data is entered erroneously and outputs do not build. The github page will retain the last successfully built copies.
2. Outputs respect their profiles. For example, the PDF output must be exactly 1 page. Adding too many bullets without appropriate filtering (`tags`, `importance` level, `max_bullets`) or changing the profile of the PDF output can cause failure.