

### Plan Tab – Revised Approach

**1. Remove “Add Plan” entirely**
The Plan tab will no longer support creating or editing plans from this screen. The existing **Add Plan** section should be fully removed. This includes all related UI components, screens, routes, logic, and supporting files. Please audit the codebase to identify and delete everything tied to the Add Plan flow so there are no unused states or dead paths left behind.

**2. Promote Routines as the primary action**
With the Add Plan section removed, routines become the main interaction on the Plan tab.

* Directly below the header (days + navigation arrows), introduce a compact action row.
* This row should contain two actions side by side:

  * **Add Routine**
  * **Explore Routines**
* This should be a single row with two columns, visually lightweight and clearly secondary to the header.

Below this action row, add a **My Routines** section.

* Users can create and store any number of routines.
* Routines are not locked to a single day; instead, users can choose which routine to follow on a given day based on their plan or intent.
* The UI should clearly communicate that routines are reusable building blocks, not rigid schedules.

**3. Redesign the “Create Routine” screen**
When the user taps **Add Routine**, they land on the Create Routine screen. This screen needs a full visual rethink with a focus on simplicity and familiarity.

* The interaction should feel like adding items to a checklist.
* Place the text input at the bottom of the screen.
* Users type an exercise or activity name (e.g., “Warm-up”, “Mobility”, “Squats”) and add it.
* Do not include sets, reps, weights, or any structured metadata.
* Users can add an unlimited number of items.
* The list of added items should be scrollable.
* Spacing, padding, alignment, and visual rhythm must be cleaned up—this screen currently feels cluttered and unbalanced.

**4. Exercise list interactions (edit, delete, reorder)**
Once exercises are added, the list UI should be simple, modern, and consistent.

* Editing and deleting individual exercises should feel natural and predictable.
* Confirmation states (especially for delete) must be clear and in sync with the overall design language.
* Each exercise row should include a drag handle (hamburger icon) on the left.
* Long-press and drag should allow users to reorder exercises freely.

**5. Fix Save / Cancel accessibility issues**
The current placement of **Save** and **Cancel** is too close to the status bar, causing tap issues.

* These actions need more breathing room and better prominence.
* Ensure they are always easy to reach and reliably tappable.
* Re-evaluate whether their placement or layout should change (for example, bottom-anchored actions or a clearer header layout).

**6. Visual inspiration and research**
Use established fitness applications (including Heavy) as inspiration, particularly for:

* Button placement
* List interactions
* Editing and confirmation patterns

The goal is not to copy, but to align with interaction patterns users already understand while keeping the UI minimal, calm, and modern.

---

This keeps the scope focused: remove planning friction, elevate routines, and make creation feel effortless rather than structured or intimidating.
