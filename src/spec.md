# Specification

## Summary
**Goal:** Add subtle UI animations to draw attention to login for unauthenticated users and make the post-login username setup modal transitions feel smoother.

**Planned changes:**
- Add a gentle looping brightness/pulse attention animation to the Login button when the user is unauthenticated, and automatically disable it during the “Logging in...” state and after authentication.
- Add smooth enter/exit animations (fade + slight slide) to the ProfileSetupModal content so it animates in when opened and animates out when closing without abrupt unmounting, while keeping existing modal behavior and gating logic unchanged.

**User-visible outcome:** Logged-out users see a subtle pulsing Login button until they begin logging in; after login, the username setup modal opens and closes with smooth transitions instead of popping in/out.
