// Load data files - paths are relative to project root (--root .)
#let resume-data = yaml("/src/data/resume.yaml")
#let profiles-config = yaml("/src/data/profiles.yaml")

// Safe dictionary access helper
#let get(dict, key, default: none) = {
  if key in dict { dict.at(key) } else { default }
}

// Helper function to filter bullets based on profile criteria
#let filter-bullets(bullets, profile) = {
  if bullets == none or bullets.len() == 0 {
    return ()
  }

  let min-importance = get(profile, "min_importance", default: 0)
  let max-bullets = get(profile, "max_bullets_per_experience", default: bullets.len())
  let include-tags = get(profile, "include_tags", default: ())
  let exclude-tags = get(profile, "exclude_tags", default: ())

  let filtered = bullets.filter(b => get(b, "importance", default: 0) >= min-importance)

  if include-tags != none and include-tags.len() > 0 {
    filtered = filtered.filter(b =>
      get(b, "tags", default: ()).any(tag => include-tags.contains(tag))
    )
  }

  if exclude-tags != none and exclude-tags.len() > 0 {
    filtered = filtered.filter(b =>
      not get(b, "tags", default: ()).any(tag => exclude-tags.contains(tag))
    )
  }

  filtered
    .sorted(key: b => get(b, "importance", default: 0))
    .rev()
    .slice(0, calc.min(filtered.len(), max-bullets))
}

// Resume wrapper
#let resume(
  author: "",
  location: "",
  email: "",
  phone: "",
  portfolio: "",
  body,
) = {

  set document(author: author, title: author)
  set text(font: "New Computer Modern", size: 10pt)
  set page(margin: 0.5in, paper: "us-letter")

  [= #(author)]

  let contact-item(value, link-type: "") = {
    if value != "" and value != none {
      if link-type != "" {
        link(link-type + value)[#value]
      } else {
        value
      }
    }
  }

  pad(
    top: 0.2em,
    align(center)[
      #{
        let items = (
          contact-item(phone),
          contact-item(location),
          contact-item(email, link-type: "mailto:"),
          contact-item(portfolio, link-type: "https://"),
        )
        items.filter(x => x != none).join("  |  ")
      }
    ],
  )

  body
}

// Layout helpers
#let two-by-two-layout(top-left: "", top-right: "", bottom-left: "", bottom-right: "") = {
  grid(
    columns: (3fr, 1fr),
    column-gutter: 1em,
    row-gutter: 0.5em,
    align: (top + left, top + right),
    top-left, top-right,
    bottom-left, bottom-right
  )
}

#let dates-util(start-date: "", end-date: "") = {
  if end-date == "" { start-date }
  else { start-date + " " + $dash.em$ + " " + end-date }
}

// Components
#let work(company: "", role: "", dates: "", tech-used: "", location: "") = {
  two-by-two-layout(
    top-left: strong(company) + " | " + strong(role),
    top-right: dates,
    bottom-left: tech-used,
    bottom-right: emph(location),
  )
}

#let project(name: "", dates: "", tech-used: "", url: "") = {
  two-by-two-layout(
    top-left: strong(name),
    top-right: dates,
    bottom-left: tech-used,
    bottom-right: if url != "" { link("https://" + url)[#url] } else { "" },
  )
}

#let edu(institution: "", location: "", degree: "", dates: "") = {
  two-by-two-layout(
    top-left: strong(institution),
    top-right: dates,
    bottom-left: degree,
    bottom-right: emph(location),
  )
}

// Main rendering logic
#let render-resume(profile-name: "default") = {

  let profile = get(profiles-config.profiles, profile-name, default: ())

  let data = resume-data

  let experiences = get(data, "experiences", default: ())

  let filtered-experiences = experiences.map(exp => {
    (
      "company": get(exp, "company", default: ""),
      "role": get(exp, "role", default: ""),
      "start": get(exp, "start", default: ""),
      "end": get(exp, "end", default: ""),
      "location": get(exp, "location", default: ""),
      "tech-used": get(exp, "tech-used", default: ""),
      "bullets": filter-bullets(get(exp, "bullets", default: ()), profile)
    )
  }).filter(exp => exp.at("bullets").len() > 0)

  let filtered-projects = if "projects" in data {
    data.projects.map(proj => {
      (
        "name": get(proj, "name", default: ""),
        "dates": get(proj, "dates", default: ()),
        "tech-used": get(proj, "tech-used", default: ""),
        "url": get(proj, "url", default: ""),
        "bullets": filter-bullets(get(proj, "bullets", default: ()), profile)
      )
    }).filter(p => p.at("bullets").len() > 0)
  } else {
    ()
  }

  let personal = get(data, "personal", default: ())

  show: resume.with(
    author: get(personal, "name", default: ""),
    location: get(personal, "location", default: ""),
    email: get(personal, "email", default: ""),
    phone: get(personal, "phone", default: ""),
    portfolio: get(personal, "portfolio", default: ""),
  )

  if "education" in data and data.education.len() > 0 {
    [== Education]

    for item in data.education {
      let degrees = get(item, "degrees", default: ())
      let degrees-text = degrees.map(d => get(d, "degree", default: "")).join(" \n")

      edu(
        institution: get(item, "institution", default: ""),
        location: get(item, "location", default: ""),
        degree: degrees-text,
        dates: "",
      )
    }
  }

  if filtered-experiences.len() > 0 {
    [== Experience]

    for exp in filtered-experiences {
      work(
        company: exp.at("company"),
        role: exp.at("role"),
        dates: dates-util(
          start-date: str(exp.at("start")),
          end-date: str(exp.at("end"))
        ),
        tech-used: exp.at("tech-used"),
        location: exp.at("location"),
      )

      for bullet in exp.at("bullets") {
        [- #(get(bullet, "text", default: "").replace("$", "\\$"))]
      }
    }
  }

  if filtered-projects.len() > 0 {
    [== Projects]

    for proj in filtered-projects {
      project(
        name: proj.at("name"),
        dates: "",
        tech-used: proj.at("tech-used"),
        url: proj.at("url"),
      )

      for bullet in proj.at("bullets") {
        [- #get(bullet, "text", default: "")]
      }
    }
  }

  if "skills" in data and data.skills.len() > 0 {
    [== Technical Skills]

    for skill in data.skills {
      [- *#get(skill, "category", default: "")*: #get(skill, "items", default: ()).join(", ")]
    }
  }
}

#render-resume(profile-name: sys.inputs.at("profile", default: "default"))
