# AITrip product specification

A traveler describes the trip they want in one message. AITrip should turn their interests, budget, dates and practical constraints into a feasible itinerary, explain the most important tradeoffs, and help them revise it when conditions change.

## The acceptance journey

> Plan a four-day nature trip from Hyderabad to Ooty for two travelers with a total budget of ₹15,000. Prefer trains, vegetarian meals and budget accommodation.

Eventually this request should yield four days of timed activities with travel allowances, feasible transport legs, accommodation guidance, vegetarian meal options, weather context, packing suggestions and itemized costs. The budget applies to both travelers together. If essential travel dates are missing, ask for them before treating a forecast or timetable as applicable. If credible estimates exceed the budget, identify the shortfall and offer alternatives.

The traveler can inspect agent decisions, save and reopen the trip, trigger a clearly marked simulated rain disruption, review a proposed substitute and cost difference, approve a new version, and export a PDF. Keep a comparable ICS export on the roadmap. Phase 1 covers discovering referenced places and saving the traveler's original brief. [Roadmap](ROADMAP.md)

## Product requirements

- Use a typed LangGraph workflow with a supervisor, intent parsing, research, weather, transport, accommodation, food and experiences, safety, budget, conflict resolution, packing and consent-based preference memory. Support configurable Gemini and OpenAI adapters. Use bounded retries, checkpoints and concise execution events.
- Represent verified provider information, cited reference material, calculated estimates, AI recommendations and sample data distinctly. For provider outages, show the evidence available and explain which answer remains uncertain. Booking confirmations require an actual booking record. Automatic purchases and reservations are outside the planning workflow.
- Combine conversational input with optional structured controls. Expose execution progress, maps, itemized budgets, trip details, version history, exports, profiles, consent controls and notifications as their underlying capabilities become available.
- Support keyboard navigation, responsive layouts and a lightweight alternative to the interactive Earth. Add browser speech features and collaborative preferences after the core planning journey is reliable.
- Introduce PostgreSQL migrations, ownership checks, structured diagnostics and CI alongside their corresponding features. Keep live provider credentials server-side and deployable through environment configuration.
- Measure workflow completion, constraint satisfaction, budget accuracy, schedule feasibility, personalization, latency, provider failure handling and replanning against a reproducible single-model baseline. Report observed results with inputs and configuration. [Evaluation and testing](TESTING.md)
