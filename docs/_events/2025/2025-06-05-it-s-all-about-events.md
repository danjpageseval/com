---
title: It's All About Events
type: meetup
start: '2025-06-05'
end: '2025-06-05'
organizer: Belgian Erlang And Elixir Meetup
ecosystem: beam
logo: "/assets/images/events/ohio-elixir-4.jpg"
link: https://www.meetup.com/elixir-belgium/events/307160508/
source_id: 04ae4420-bcf1-4121-8934-9e39f4018990
---
Talk 1: ExESDB - a BEAM-native Event Store by Raf Lefever

One of the arguments for BEAM development is that it comes “batteries included”. Be it caching, storage, pub/sub, observability etc… the Erlang ecosystem always has the option to avoid external dependencies.

For Event Sourcing use cases however, the Event Store is often a separate service, like Kurrent (previously: EventStore) or AxonIQ. This project is attempt at addressing this point, by building further upon the work of the rabbitmq/khepri and rabbitmq/ra subsystems. As part of the larger Macula project, we aim at minimizing dependencies on external services, since we intend to leverage The Nerves Project for software delivery within a decentralized system.

Talk 2: Livebook Playground: Hands‑On Commanded, CQRS & Event Sourcing by Mehdi Necibi

Together, we’ll explore the principles and practice of event‑driven in an interactive Livebook. We’ll dispatch commands, persist events, and project models. By the end of the session, we will have assembled a fully functional CQRS pipeline with Commanded.

Talk 3: A Dive Into an Eventsourcing Webservice by Yuri Leikind

Join me for a deep dive into a real-world webservice built with CQRS and Eventsourcing principles. This isn’t a Commanded story because we didn’t use it. Instead, we rolled our own homemade eventsourcing miniframework lovingly crafted from both the successes and scars of past projects that did use Commanded.

I’ll walk you through the architecture, demo how we can rebuild projections on the fly in a live system without breaking a sweat (or the service). And if we’re feeling especially rebellious, we might even commit the ultimate heresy: rewriting the eventstore itself. Yes, that unforgivable sin of the Eventsourcing world.
