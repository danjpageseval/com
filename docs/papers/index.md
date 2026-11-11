---
title: Academic Papers
description: Research about Erlang, Elixir and the BEAM
layout: page_ico
logo: /assets/images/eef/wg-logo/EEF-EDU.svg
logo_url: /wg/edu/
---
Papers are listed by original publication date, newest first. The BEAM technologies each paper covers are shown below its title.

Know a paper that belongs here? [Open an issue](https://github.com/erlef/marketing-wg/issues/new) to suggest it.

{% assign techs = site.data.papers | map: "technologies" | join: "," | split: "," | uniq | sort %}
<div class="paper-filter" role="group" aria-label="Filter papers by technology" hidden>
  <button type="button" class="paper-tag paper-tag-all" data-filter="" aria-pressed="true">All papers</button>
  {% for tech in techs %}<button type="button" class="paper-tag paper-tag-{{ tech | slugify }}" data-filter="{{ tech }}" aria-pressed="false">{{ tech }}</button>
  {% endfor %}
</div>

<ul class="paper-list">
{% for paper in site.data.papers %}
  <li class="paper" data-tech="{{ paper.technologies | join: ',' }}">
    <span class="paper-year">{{ paper.date | date: "%Y" }}</span>
    <div class="paper-body">
      <h3 class="paper-title"><a href="{{ paper.url }}">{{ paper.title }}</a></h3>
      <p class="paper-meta">{% if paper.author and paper.author != "Unknown" %}{{ paper.author }} · {% endif %}{{ paper.language }} · {% if paper.paywall %}Paywalled{% else %}Free{% endif %}</p>
      <p class="paper-tags">{% for tech in paper.technologies %}<span class="paper-tag paper-tag-{{ tech | slugify }}">{{ tech }}</span>{% endfor %}</p>
    </div>
  </li>
{% endfor %}
</ul>

<script>
(function () {
  var bar = document.querySelector('.paper-filter');
  if (!bar) return;
  bar.hidden = false;
  var buttons = bar.querySelectorAll('button');
  var papers = document.querySelectorAll('.paper');
  bar.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var f = btn.getAttribute('data-filter');
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    papers.forEach(function (p) {
      p.hidden = f !== '' && p.getAttribute('data-tech').split(',').indexOf(f) === -1;
    });
  });
})();
</script>
