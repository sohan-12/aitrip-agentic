# Phased delivery

Phase status and verification evidence are tracked separately from the acceptance criteria below. [Implementation status](IMPLEMENTATION_STATUS.md)

| Phase | Acceptance criteria |
| --- | --- |
| 1. Foundation and recognizable UI | The React/TypeScript shell starts with FastAPI, migrations establish the first schema, and a traveler can use the floating navigation and interactive Earth. A real API supplies referenced destinations. The traveler can save and reopen a private trip brief. Mobile, keyboard and WebGL fallback paths remain usable. |
| 2. Conversational planning | Parse the Hyderabad–Ooty request into typed constraints. Execute a real LangGraph with agent roles, conditional routing, checkpoints, bounded retries and structured events. Produce a validated four-day plan or an actionable explanation of missing information. |
| 3. External evidence | Query authorized places and weather providers, distinguish estimates from verified transport and accommodation data, and surface availability, timeout or missing-key states. Record retrieval time and source for provider results. |
| 4. Constraints and revisions | Check budget totals, travel buffers and overlaps. Support multi-city constraints and consented preferences. A simulated rain event produces a reviewable change, cost difference and user-approved revision while preserving the original. |
| 5. Complete traveler experience | Secure sign-in scopes history, profile, memory and trip access. Support history operations, execution visualization, packing lists, notifications, PDF and ICS export, and voice controls where supported. |
| 6. Engineering and evaluation | CI exercises backend, frontend and end-to-end journeys. Document responsive, accessibility, dependency and security checks. Publish reproducible inputs, limitations and measured comparisons with a single-LLM baseline. |

## End-to-end acceptance checklist

- [ ] Recover the example request's origin, destination, four days, two travelers, ₹15,000 total, train preference, vegetarian diet and budget stay.
- [ ] Expose actual agent events with durations and failures. Cite evidence and identify estimates in the results.
- [ ] Show transport feasibility, four days with travel allowances, itemized costs and material tradeoffs.
- [ ] Optimize an infeasible schedule or budget within bounded limits, or report the unresolved constraint.
- [ ] Save and reopen the generated itinerary under the correct user. A persisted natural-language brief is an earlier milestone.
- [ ] Preview a rain-related revision, including its cost effect, and persist it only after approval.
- [ ] Export the saved itinerary as a readable PDF.
