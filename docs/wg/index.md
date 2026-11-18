---
title: Working Groups
description: The EEF sponsors Working Groups to solve specific challenges faced by users of BEAM technology
layout: page_ico
logo: /assets/images/eef-logo.svg
logo_url: /org/
---
Areas of particular interest include documentation, interoperability, and performance.

{%- assign groups = site.data.sections | where: "name", "Working Groups" | first %}
<ul class="wg-index">
{%- for item in groups.items %}
  {%- assign code = item.wg | downcase %}
  {%- assign data = site.data.wg[code] %}
  <li>
    <img src="/assets/images/eef/wg-logo/EEF-{{ item.wg | upcase }}.svg" height="20px" alt="">
    <div>
      <h3><a href="{{ item.link }}">{% if data %}{{ data.title }}{% else %}{{ item.title }}{% endif %}</a></h3>
      <p>{% if data %}{{ data.description }}{% else %}{{ item.description }}{% endif %}</p>
    </div>
  </li>
{%- endfor %}
</ul>

## Participating

Do you have an idea for a working group? Anyone can start one by following these steps:

1. Fill out the [Proposal Template]({{ site.data.links.wg_template }}).
2. Email the proposal to [wg@erlef.org](mailto:wg@erlef.org).
