---
title: Events
description: Conferences, meetups, training and deadlines across the Erlang ecosystem
layout: page_ico
logo: /assets/images/eef/wg-logo/EEF-COM.svg
logo_url: /wg/com/
---
<div class="events-toolbar" role="toolbar" aria-label="Event filters">
  <div class="events-filter" data-filter="type">
    <button type="button" data-value="all" aria-pressed="true">All</button>
    {%- for t in site.data.event_types %}
    <button type="button" data-value="{{ t.type }}" aria-pressed="false">{{ t.label }}</button>
    {%- endfor %}
  </div>
  <div class="events-filter" data-filter="view">
    <button type="button" data-value="upcoming" aria-pressed="true">Upcoming</button>
    <button type="button" data-value="past" aria-pressed="false">Past</button>
  </div>
</div>

<div class="events-layout">
  <div class="events-list" id="events-list" aria-live="polite">
    <noscript><p>The event list needs JavaScript. See <a href="/events/all/">all events</a> instead.</p></noscript>
  </div>
  <aside class="events-calendar" id="events-calendar" aria-label="Calendar"></aside>
</div>

<p class="events-more">
  <a href="/events/all/">All events with full details</a> ·
  <a href="/events.ics">Subscribe to the calendar</a> ·
  <a href="#submit-an-event">Submit an event</a>
</p>

## Submit an event

<a id="submit-an-event"></a>
Anyone can submit an event. Open a GitHub issue using the form for your event type:

{% for t in site.data.event_types -%}
- [{{ t.label }}](https://github.com/erlef/marketing-wg/issues/new?template=event-{{ t.type }}.yml)
{% endfor %}

A maintainer reviews the issue. Once it is labelled `approved`, a pull request with the event is opened automatically, and the event is published when that pull request is merged. Times are given in the event's local time zone, which is required.

<script type="application/json" id="event-config">
{ "types": {{ site.data.event_types | jsonify }}, "colors": {{ site.data.event_colors | jsonify }} }
</script>
<script src="/assets/js/events.js" defer></script>
