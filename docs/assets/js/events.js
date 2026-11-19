// Events overview (/events/) and the home page "upcoming" list.
// Data comes from /events.json; settings from the #event-config JSON block.
(function () {
  "use strict";

  var config = JSON.parse(document.getElementById("event-config").textContent);
  var types = {};
  config.types.forEach(function (t) { types[t.type] = t; });
  var colors = config.colors;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  var SHORT = MONTHS.map(function (m) { return m.slice(0, 3); });

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function addDays(dateStr, days) {
    var d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + days);
    return iso(d);
  }
  var today = iso(new Date());

  // Normalise each event to firstDay/lastDay (YYYY-MM-DD) and a display start.
  function normalise(e) {
    var isDeadline = e.type === "deadline";
    var first = (isDeadline ? (e.closes || e.opens) : (e.start || e.opens || e.closes)) || "";
    var last = (isDeadline ? e.closes : (e.end || e.start)) || first;
    e.firstDay = first.slice(0, 10);
    e.lastDay = last.slice(0, 10);
    e.ended = e.lastDay < today;
    return e;
  }

  function color(e) { return colors[e.ecosystem] || colors["default"]; }

  function icon(e, cls) {
    if (e.logo) {
      var img = document.createElement("img");
      img.src = e.logo; img.alt = ""; img.loading = "lazy"; img.className = cls + " event-logo";
      return img;
    }
    var dot = document.createElement("span");
    dot.className = cls + " event-dot";
    dot.style.background = color(e);
    return dot;
  }

  function fmt(dateTime) {
    var d = dateTime.slice(0, 10).split("-");
    var s = SHORT[+d[1] - 1] + " " + (+d[2]) + ", " + d[0];
    if (dateTime.length > 10) s += " " + dateTime.slice(11, 16);
    return s;
  }

  function dateText(e) {
    var tz = e.timezone ? " (" + e.timezone + ")" : "";
    if (e.type === "deadline") return "Closes " + fmt(e.closes || e.firstDay) + tz;
    var s = fmt(e.start || e.firstDay);
    var end = e.end || "";
    if (end && end.slice(0, 10) !== e.firstDay) s += " – " + fmt(end);
    else if (end.length > 10) s += "–" + end.slice(11, 16);
    return s + tz;
  }

  function detailsLink(e) { return "/events/all/#" + encodeURIComponent(e.id); }

  function row(e) {
    var li = document.createElement("li");
    li.className = "event-row";
    li.dataset.date = e.firstDay;
    li.appendChild(icon(e, "event-icon"));
    var body = document.createElement("div");
    var a = document.createElement("a");
    a.href = detailsLink(e);
    a.textContent = e.title;
    var meta = document.createElement("div");
    meta.className = "event-meta";
    var type = document.createElement("span");
    type.className = "event-type";
    type.textContent = e.type;
    meta.appendChild(type);
    meta.appendChild(document.createTextNode(" " + dateText(e) + (e.location ? " · " + e.location : "")));
    body.appendChild(a);
    body.appendChild(meta);
    li.appendChild(body);
    return li;
  }

  // ---- Home page: upcoming events within each type's lead time --------------
  function renderUpcoming(el, events) {
    var limit = +(el.dataset.limit || 10);
    var list = events.filter(function (e) {
      if (e.ended) return false;
      var lead = (types[e.type] && types[e.type].lead_days) || 61;
      if (e.type === "deadline") {
        var opens = e.opens ? e.opens.slice(0, 10) : addDays(e.lastDay, -lead);
        return opens <= today;
      }
      return e.firstDay <= addDays(today, lead);
    }).sort(function (a, b) { return a.firstDay < b.firstDay ? -1 : a.firstDay > b.firstDay ? 1 : 0; })
      .slice(0, limit);
    var ul = document.createElement("ul");
    ul.className = "event-rows";
    if (!list.length) {
      var li = document.createElement("li");
      li.textContent = "No upcoming events listed yet.";
      ul.appendChild(li);
    }
    list.forEach(function (e) { ul.appendChild(row(e)); });
    el.innerHTML = "";
    el.appendChild(ul);
  }

  // ---- Events overview -------------------------------------------------------
  function renderOverview(listEl, calEl, events) {
    var state = { type: "all", view: "upcoming", month: today.slice(0, 7) };

    function visible() {
      return events.filter(function (e) {
        return state.type === "all" || e.type === state.type;
      });
    }

    function renderList() {
      var items = visible().filter(function (e) { return state.view === "past" ? e.ended : !e.ended; });
      items.sort(function (a, b) {
        var c = a.firstDay < b.firstDay ? -1 : a.firstDay > b.firstDay ? 1 : 0;
        return state.view === "past" ? -c : c;
      });
      listEl.innerHTML = "";
      if (!items.length) {
        var p = document.createElement("p");
        p.textContent = state.view === "past" ? "No past events of this type." : "No upcoming events of this type yet.";
        listEl.appendChild(p);
        return;
      }
      var month = null, ul = null;
      items.forEach(function (e) {
        var m = e.firstDay.slice(0, 7);
        if (m !== month) {
          month = m;
          var h = document.createElement("h3");
          h.className = "event-month";
          h.textContent = MONTHS[+m.slice(5, 7) - 1] + " " + m.slice(0, 4);
          listEl.appendChild(h);
          ul = document.createElement("ul");
          ul.className = "event-rows";
          listEl.appendChild(ul);
        }
        ul.appendChild(row(e));
      });
    }

    function renderCalendar() {
      var y = +state.month.slice(0, 4), m = +state.month.slice(5, 7) - 1;
      var firstOfMonth = new Date(y, m, 1, 12);
      var daysInMonth = new Date(y, m + 1, 0, 12).getDate();
      var offset = (firstOfMonth.getDay() + 6) % 7; // Monday first
      var byDay = {};
      visible().forEach(function (e) {
        var d = e.type === "deadline" ? e.lastDay : e.firstDay;
        var end = e.type === "deadline" ? e.lastDay : e.lastDay;
        // Cap long ranges so a bad record cannot loop for years.
        for (var i = 0; d <= end && i < 62; i++, d = addDays(d, 1)) {
          if (d.slice(0, 7) === state.month) (byDay[d] = byDay[d] || []).push(e);
        }
      });

      calEl.innerHTML = "";
      var head = document.createElement("div");
      head.className = "cal-head";
      var prev = document.createElement("button");
      prev.type = "button"; prev.textContent = "‹"; prev.setAttribute("aria-label", "Previous month");
      var next = document.createElement("button");
      next.type = "button"; next.textContent = "›"; next.setAttribute("aria-label", "Next month");
      var title = document.createElement("span");
      title.textContent = MONTHS[m] + " " + y;
      prev.onclick = function () { state.month = iso(new Date(y, m - 1, 1, 12)).slice(0, 7); renderCalendar(); };
      next.onclick = function () { state.month = iso(new Date(y, m + 1, 1, 12)).slice(0, 7); renderCalendar(); };
      head.appendChild(prev); head.appendChild(title); head.appendChild(next);
      calEl.appendChild(head);

      var grid = document.createElement("div");
      grid.className = "cal-grid";
      ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach(function (d) {
        var c = document.createElement("div"); c.className = "cal-dow"; c.textContent = d; grid.appendChild(c);
      });
      for (var i = 0; i < offset; i++) grid.appendChild(document.createElement("div"));
      for (var day = 1; day <= daysInMonth; day++) {
        var date = state.month + "-" + pad(day);
        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cal-day" + (date === today ? " cal-today" : "");
        var num = document.createElement("span");
        num.className = "cal-num"; num.textContent = day;
        cell.appendChild(num);
        var evs = byDay[date] || [];
        if (evs.length) {
          cell.classList.add("cal-has-events");
          cell.title = evs.map(function (e) { return e.title; }).join("\n");
          var marks = document.createElement("span");
          marks.className = "cal-marks";
          evs.slice(0, 3).forEach(function (e) { marks.appendChild(icon(e, "cal-mark")); });
          if (evs.length > 3) {
            var more = document.createElement("span");
            more.className = "cal-more"; more.textContent = "+" + (evs.length - 3);
            marks.appendChild(more);
          }
          cell.appendChild(marks);
          cell.onclick = (function (d) { return function () { jumpTo(d); }; })(date);
        } else {
          cell.disabled = true;
        }
        grid.appendChild(cell);
      }
      calEl.appendChild(grid);
    }

    function jumpTo(date) {
      var view = date < today ? "past" : "upcoming";
      // An ongoing event that started earlier is still "upcoming".
      if (view === "past") {
        var ongoing = visible().some(function (e) { return !e.ended && e.firstDay <= date && date <= e.lastDay; });
        if (ongoing) view = "upcoming";
      }
      if (state.view !== view) setFilter("view", view);
      var rows = listEl.querySelectorAll(".event-row");
      var target = null;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].dataset.date === date) { target = rows[i]; break; }
      }
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("event-flash");
        setTimeout(function () { target.classList.remove("event-flash"); }, 1600);
      }
    }

    function setFilter(name, value) {
      state[name] = value;
      document.querySelectorAll('.events-filter[data-filter="' + name + '"] button').forEach(function (b) {
        b.setAttribute("aria-pressed", b.dataset.value === value ? "true" : "false");
      });
      renderList();
      renderCalendar();
    }

    document.querySelectorAll(".events-filter").forEach(function (group) {
      group.addEventListener("click", function (ev) {
        var b = ev.target.closest("button");
        if (b) setFilter(group.dataset.filter, b.dataset.value);
      });
    });

    renderList();
    renderCalendar();
  }

  fetch("/events.json")
    .then(function (r) { return r.json(); })
    .then(function (events) {
      events = events.map(normalise);
      var upcoming = document.getElementById("upcoming-events");
      if (upcoming) renderUpcoming(upcoming, events);
      var list = document.getElementById("events-list");
      var cal = document.getElementById("events-calendar");
      if (list && cal) renderOverview(list, cal, events);
    })
    .catch(function () {
      ["upcoming-events", "events-list"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = '<p>Events could not be loaded. See <a href="/events/all/">all events</a>.</p>';
      });
    });
})();
