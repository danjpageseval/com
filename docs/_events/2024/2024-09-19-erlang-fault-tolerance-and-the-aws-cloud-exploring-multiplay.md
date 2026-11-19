---
title: Erlang fault tolerance and the AWS cloud + Exploring Multiplayer Games in Elixir
type: meetup
start: '2024-09-19'
end: '2024-09-19'
organizer: BEAM Languages United - Elixir, Erlang & More @ Stockholm
ecosystem: beam
logo: "/assets/images/events/beam-languages-united-elixir-erlang-more.png"
link: https://www.meetup.com/l-o-b-stockholm/events/303133811/?eventOrigin=group_upcoming_events
source_id: f3b47cf4-7f9a-49d1-a12b-68c8f80a3061
---
Details Host This BEAM Languages United meetup is hosted by Erlang Solutions with drinks and snacks sponsored by Meta.

Agenda 17:30-17:50 Registration 17:50-18:00 Intro 18:00-18:30 Talk 1: Exploring approaches to multiplayer games in Elixir 18:30-18:50 Break: Snacks and soft drinks 18:50-19:20 Talk 2: Erlang fault tolerance and the AWS cloud 19:20-19:50 Mingle and networking

Talk 1: Exploring Approaches to Multiplayer Games in Elixir - Brian Underwood I’ve long been interested in how to best design multiplayer games in Elixir. To explore this idea I first created a simple game based on the “set” card game which I developed with the help of user feedback. Then, to try attacking a more complex problem, I created a 2D spaceship game where players hunt for their opponents’ electric field signatures. In this talk I’ll discuss the process architectures I used, comparing and contrasting with different approaches including using the ECS (entity-component-system) pattern.

Talk 2: Erlang Fault Tolerance and the AWS Cloud - Thomas Arts Assume you carefully have crafted a distributed Erlang application consisting of several nodes that implements some fault tolerance. If some hardware fails, you know another Erlang node on different hardware will take care of this. Now you move to the cloud … and your hardware are virtual instances. If two instances happen to be on the same hardware or happen to share the same network card, you probably have again a single point of failure. That is less fault tolerant than you designed it for in the first place. We address cloud migration by means of a case study from the NHS. The NHS ran their nodes in 3 different data centres, in each data centre a large number of connected nodes; prepared to resist at least two hardware failures per data centre. But how to move that to a set of virtual nodes and keep some kind of guarantees?

Any allergies or special requirements? We plan to serve some snacks and soft drinks during the event. Let us know if you have any allergies or any other special requirements.
