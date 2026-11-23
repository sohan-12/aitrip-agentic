# UI reference

The original AITrip landing page places a rotating Earth above editorial destination sections. Destination selection gives the globe a purpose and carries a place into planning. The navigation uses a dark translucent surface, while cyan accents identify primary actions against black. These are the visual and interaction cues for the new application. [Landing page](https://github.com/sohan-12/AItrip/blob/main/src/pages/Landing.jsx) · [Navigation](https://github.com/sohan-12/AItrip/blob/main/src/components/navigation/Navbar.jsx)

The second project explores map controls, compact mobile navigation, a day-by-day itinerary and a discoverable PDF download. Use these as interaction references when the corresponding capabilities exist. The product brief requires grounded travel planning and auditable revisions. A booking banner, generated flight number or simulated confirmation from the prototype provides no evidence of availability. [Secondary UI reference](https://github.com/sriram32134/final-year-project/tree/8d1d8846cb74b347c094ff7e19d1d36da8cb057b/AItrip-main/src)

## Design decisions

- Give the Earth scene room to breathe. Keep destination search and the planning action usable with a keyboard and with WebGL unavailable.
- Work from black surfaces, near-black panels, thin translucent borders, cyan accents and large readable type. Preserve contrast for controls and explanatory text.
- Use destination photography with meaningful place names, an editorial description and traceable sources. Keep controls legible on narrow screens and respect reduced motion.
- Write original components in TypeScript. Track image and texture attribution alongside the assets and verify third-party usage terms when replacing imagery.
