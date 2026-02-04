# Specification

## Summary
**Goal:** Fix mobile-only dashboard chart layout issues so pie chart percentage labels stay contained and the Finance Trends line chart uses full card width, without impacting desktop/tablet layouts or changing chart data/logic.

**Planned changes:**
- Update mobile-only styling/layout for Recharts pie charts so all SVG elements (including percentage labels/label lines) remain fully visible within the card boundaries.
- Update mobile-only sizing/layout for the Finance Trends line chart container so the chart expands to the full available card width and improves x-axis label readability, without altering data/formatting.

**User-visible outcome:** On small screens, pie charts no longer overflow their cards (percentages remain visible), and the Finance Trends chart appears wider and easier to read while desktop/tablet views remain unchanged.
