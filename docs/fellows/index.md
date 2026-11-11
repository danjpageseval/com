---
title: Fellows
description: Honoring those who made extraordinary contributions to our community
layout: page_ico
logo: /assets/images/eef/wg-logo/EEF-FEL.svg
logo_url: /wg/fel/
---
What is a fellow? Those who have made extraordinary contributions to our community, without some of whom there would be no community, or even Erlang/OTP at all. Our fellows are to be celebrated and honored. Without further ado, we present our fellows.

See the [Fellowship Working Group](/wg/fel/) for more information.

<ul class="fellow-index">
{% for fellow in site.data.fellows %}
  <li>
    <a href="#{{ fellow.slug }}">
      <img src="{{ fellow.avatar | relative_url }}" alt="">
      <span>{{ fellow.name }}</span>
    </a>
  </li>
{% endfor %}
</ul>

{% for fellow in site.data.fellows %}
<section class="fellow" id="{{ fellow.slug }}">
  <img class="fellow-avatar" src="{{ fellow.avatar | relative_url }}" alt="Portrait of {{ fellow.name }}" loading="lazy">
  <div class="fellow-body">
    <h2>{{ fellow.name }}</h2>
    <p>{{ fellow.about }}</p>
  </div>
</section>
{% endfor %}
