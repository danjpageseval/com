---
title: Topics
description: Articles by topic
layout: page_ico
logo: /assets/images/eef/wg-logo/EEF-COM.svg
logo_url: /wg/com/
---
{%- assign topics = site.posts | map: "topics" | compact | join: "," | split: "," | uniq | sort_natural -%}

{% include topic-cloud.html %}

{% for topic in topics %}
{%- assign tagged = site.posts | where_exp: "p", "p.topics contains topic" -%}
<section class="topic" id="{{ topic | slugify }}">
  <h2>{{ topic }}</h2>
  <ul class="post-container">
  {%- for item in tagged -%}
    <li><img src="/assets/images/eef/wg-logo/EEF-{{ item.tags | first | upcase }}.svg" height="14px" alt=""></li>
    <li><a href="{{ item.url }}">{{ item.title }}</a></li>
    <li>{{ item.date | date: "%Y-%m-%d" }}</li>
  {%- endfor -%}
  </ul>
</section>
{% endfor %}
