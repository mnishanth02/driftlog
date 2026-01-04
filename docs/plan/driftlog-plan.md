## Core Product Definition (locked)

**App purpose**
A calm, offline-first tool to:

* loosely plan workouts (intent, not prescription)
* record workouts with minimal interaction
* preserve memory, not optimize performance

Everything below serves that.

---

# 1. Modules (High-level architecture)

Think of this app as **four small modules**, not a big system.

1. Planning Module (Intent)
2. Workout Session Module (Execution)
3. Logging & Memory Module (After)
4. App Infrastructure Module (Non-negotiables)

No analytics module.
No motivation module.
No “progress” module.

---

# 2. Planning Module — *Intent, not control*

### Purpose

Hold *rough future intent* without enforcing it.

### Features

* **Weekly view**

  * Shows days of the week
  * Each day can optionally have a planned workout

* **Day-level workout intent**

  * Free-text title (e.g. “Lower”, “Push”, “Light day”)
  * Optional short note (single text field)

* **Ultra-light planning**

  * No templates
  * No validation
  * No requirement to fill all days

* **Editable at any time**

  * Plans can be changed or deleted without consequence
  * No “lock-in” once the day arrives

### Functional behavior

* Planning takes **<30 seconds** for a week
* Empty weeks are valid
* Multiple rest days are valid
* Skipped planned days are silently accepted

### Explicit exclusions

* ❌ Sets/reps/weights in planning
* ❌ Exercise libraries
* ❌ Calendar sync
* ❌ Notifications or reminders
* ❌ “Missed workout” indicators

---

# 3. Workout Session Module — *Survive the session*

This is the heart of the app.

### Purpose

Allow logging **during fatigue** with almost no thinking.

---

## 3.1 Session lifecycle

* **Start session**

  * Triggered by opening “Today”
  * No confirmation dialog
  * Session auto-starts

* **End session**

  * Manual “End Session” button
  * Optional auto-end after inactivity (configurable, silent)

* **Only one active session per day**

  * No overlap
  * No session juggling

---

## 3.2 One-Tap Logging

### Core logging unit

Each log entry contains:

* Exercise name (free text)
* Sets:

  * reps
  * weight (optional)
* Timestamp (automatic)

### Interaction rules

* Add set = **one tap**
* Previous values auto-carry forward
* Editing allowed but never required

### Design constraints

* Large tap targets
* No scrolling to continue logging
* Keyboard minimized as much as possible

---

## 3.3 Flexibility during execution

* Planned intent is **visible but passive**
* Logging is allowed even if:

  * no plan existed
  * the plan changed completely
  * exercises differ from intent

Reality always wins.

---

## 4. Logging & Memory Module — *After the workout*

### Purpose

Capture subjective context while it still exists.

---

## 4.1 Post-session reflection

Immediately after ending a session (or later):

* Optional prompts:

  * “How did this feel?”
  * “Anything to note?”
* Free-text only
* Skippable without penalty

No forced ratings.
No emojis.
No sentiment analysis.

---

## 4.2 Session history

* List of past sessions (chronological)
* Each session shows:

  * date
  * planned intent (if any)
  * exercises logged
  * reflection notes

### History behavior

* Read-only by default
* Editing allowed but hidden behind intent
* No charts, no summaries, no trends

This is a **notebook**, not a report.

---

## 5. App Infrastructure Module — *The boring stuff that matters*

These are non-negotiable.

---

## 5.1 Offline-first

* App works with:

  * airplane mode
  * no login
  * no cloud dependency

Sync (if ever added) is:

* optional
* invisible
* never blocking

---

## 5.2 Data tolerance

* Partial logs are valid
* Empty sessions are valid
* Duplicate entries are allowed
* “Messy” data is not corrected automatically

No data shaming.

---

## 5.3 Performance & reliability

* App opens instantly
* No spinners on core flows
* Local persistence only (v1)

If it lags in a gym basement, it failed.

---

## 5.4 Privacy

* No account required
* No analytics tracking
* No data export in v1 (intentional constraint)

The app assumes:

> “This is private training memory.”

---

# 6. Minimal Settings (very minimal)

Settings should fit on **one screen**.

Allowed:

* Auto-end session timeout (on/off)
* Units (kg/lb)
* Dark / light mode (optional)

Not allowed:

* Preferences that change behavior complexity

---

# 7. Explicit Non-Goals (print this and keep it visible)

This app will **not**:

* Coach
* Motivate
* Optimize
* Compare
* Judge
* Remind
* Visualize progress

It will:

* remember
* accept
* persist
* stay quiet

---

# 8. v1 Feature Checklist (Build Order)

If you want a sane build sequence:

1. Local data model
2. Today view + session start
3. One-tap logging
4. Session end
5. Weekly planning
6. History view
7. Reflection notes
8. Settings

Anything beyond this is v1.1 or never.