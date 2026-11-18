---
title: Public Records
description: Organizational records and reports from the EEF Annual General Meetings
---
## Organizational

{% for item in site.data.public_records.general -%}
- **{{ item.label }}:** {{ item.value }}
{% endfor %}

## Reports from the EEF Annual General Meetings
{% for report in site.data.public_records.agm_reports %}
### {{ report.year }}

{% for doc in report.documents -%}
- [{{ doc.title }}]({{ doc.link }})
{% endfor %}
{% endfor %}
