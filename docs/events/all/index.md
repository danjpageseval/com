---
title: All Events
description: Every community event, with full details
layout: page_ico
logo: /assets/images/eef/wg-logo/EEF-COM.svg
logo_url: /events/
---
Back to the [events overview](/events/). Subscribe to the [calendar feed](/events.ics).

{%- assign events = site.events | reverse -%}
{%- assign shown_years = "" | split: "" -%}

{% for e in events %}
{%- assign id = e.relative_path | split: "/" | last | remove: ".md" -%}
{%- assign first = e.start | default: e.opens | default: e.closes -%}
{%- assign year = first | slice: 0, 4 -%}
{%- unless shown_years contains year %}
{%- assign shown_years = shown_years | push: year %}
<h2 class="event-year" id="year-{{ year }}">{{ year }}</h2>
{%- endunless %}
{%- assign color = site.data.event_colors[e.ecosystem] | default: site.data.event_colors.default %}
<section class="event-detail" id="{{ id }}" data-type="{{ e.type }}">
  <div class="event-icon">
    {%- if e.logo %}<img src="{{ e.logo | relative_url }}" alt="" loading="lazy">{% else %}<span class="event-dot" style="background: {{ color }}"></span>{% endif -%}
  </div>
  <div class="event-body">
    <h3>{% if e.link %}<a href="{{ e.link }}">{{ e.title }}</a>{% else %}{{ e.title }}{% endif %}</h3>
    <p class="event-meta">
      <span class="event-type">{{ e.type }}</span>
      {% include event-dates.html event=e %}
      {%- if e.location %} · {{ e.location }}{% endif -%}
      {%- if e.organizer %} · {{ e.organizer }}{% endif %}
    </p>
    {%- if e.announcements %}
    <p class="event-links">{% for a in e.announcements %}<a href="{{ a.url }}">{{ a.title }}</a>{% unless forloop.last %} · {% endunless %}{% endfor %}</p>
    {%- endif %}
    {%- assign backlinks = site.events | where_exp: "x", "x.related contains id" -%}
    {%- assign rel = "" | split: "" -%}
    {%- for rid in e.related -%}
      {%- assign rpath = rid | append: ".md" -%}
      {%- assign r = site.events | where_exp: "x", "x.relative_path contains rpath" | first -%}
      {%- capture link %}{% if r %}<a href="#{{ rid }}">{{ r.title }}</a>{% else %}{{ rid }}{% endif %}{% endcapture -%}
      {%- assign rel = rel | push: link -%}
    {%- endfor -%}
    {%- for r in backlinks -%}
      {%- assign bid = r.relative_path | split: "/" | last | remove: ".md" -%}
      {%- unless e.related contains bid -%}
        {%- capture link %}<a href="#{{ bid }}">{{ r.title }}</a>{% endcapture -%}
        {%- assign rel = rel | push: link -%}
      {%- endunless -%}
    {%- endfor -%}
    {%- if rel.size > 0 %}
    <p class="event-links">Related: {{ rel | join: " · " }}</p>
    {%- endif %}
    <div class="event-description">{{ e.content | markdownify }}</div>
  </div>
</section>
{% endfor %}
