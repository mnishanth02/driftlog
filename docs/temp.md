
**Workout In-Progress Screen — Redesign Brief**

I want to rethink the primary action on the workout-in-progress screen.

Right now, the most prominent action is **“End Workout”** at the bottom. However, when a user lands on this screen, their instinct is not to end anything—it’s to **start** the workout. Most users naturally look for a “Play” or “Start” action first.

Currently, the start/play control exists in the header (top-left), which creates two problems:

* The primary action is visually split across the screen
* The most important action is not where the user’s thumb expects it

### Proposed Direction

1. **Move the primary session control to the bottom**

   * Replace the bottom **“End Workout”** button with **“Start Workout”** (or **“Start Session”**).
   * This button becomes the single, dominant action on the screen.

2. **Unify session state into one button**

   * When the user taps **Start Workout**, the session begins and the timer starts.
   * Once the session is active, the same button changes to **Pause Workout** (or **Pause Session**).
   * This removes the need for the play button in the header entirely, which can be removed.

3. **Ending the workout**

   * Ending a workout should be a deliberate action, not the default CTA.
   * One idea is to allow a **gesture-based confirmation**:

     * For example, swiping the paused button to the right could reveal or trigger **End Workout**.
   * Alternatively, ending the workout could be exposed only from the paused state, reducing accidental taps.

### Goals of This Redesign

* Make the **start action obvious and thumb-friendly**
* Reduce cognitive load during the session
* Avoid accidental workout termination
* Use **one control** to represent session state (start → pause → end)

### What I Need Help With

* Validate whether this interaction model makes sense from a UX standpoint
* Propose a cleaner, calmer interaction for ending a workout
* Suggest a state model (idle → active → paused → ended) that maps cleanly to UI
* If the direction feels solid, outline how we should implement this change

The intent is not to add complexity, but to make the screen behave the way a tired, distracted user expects it to behave.

---

This version keeps your idea intact, removes verbal noise, and frames it as a clear design problem with constraints. It also aligns tightly with DriftLog’s “low cognitive load under fatigue” philosophy.
