## Core Product Definition (locked)

**App purpose**

DriftLog is a calm, offline-first tool to:

- loosely plan workouts (**intent, not prescription**)
- record workouts with minimal interaction
- preserve memory, not optimize performance

Everything below serves that.

---

## Reality check: what DriftLog is today

- **Planning** is routines + planned dates (lightweight templates, not prescriptions).
- **Session logging** is exercise-level today (sets exist in the DB schema, but the set-logging UI is not shipped yet).
- **Memory** is history + encrypted reflections.

---

# 1. Modules (high-level architecture)

Think of this app as **four small modules**, not a big system.

1. Planning Module (Intent via routines)
2. Workout Session Module (Execution)
3. Logging & Memory Module (After)
4. App Infrastructure Module (Non-negotiables)

No analytics module.
No motivation module.
No “progress” module.

---

# 2. Planning Module — *Intent, not control* (shipped)

### Purpose

Hold *rough future intent* without enforcing it.

### What planning means in DriftLog

Planning is selecting/creating **routines** and assigning them to dates.

- A routine is a **light template**: title, optional notes, and an ordered list of exercise names.
- Planning never enforces adherence; it’s a gentle suggestion.

### Shipped UI & behavior

- **Weekly view** (Plan tab)
  - Week navigation rail with day indicators
  - Each day can have 0–N planned routines
- **Per-day routine list**
  - Shows routines planned for the selected date
  - Shows completion count (based on completed sessions)
- **Editable at any time**
  - Routines can be created/edited/deleted
  - Planned dates can be changed without consequence
- **Start from plan**
  - Starting a workout is explicit: it navigates to the session screen

### Explicit exclusions (still true)

- ❌ Sets/reps/weights in planning
- ❌ Calendar sync
- ❌ Notifications or reminders
- ❌ “Missed workout” indicators

---

# 3. Workout Session Module — *Survive the session* (shipped, exercise-level)

This is the heart of the app.

### Purpose

Allow logging **during fatigue** with almost no thinking.

---

## 3.1 Session lifecycle (as implemented)

- **Start session (explicit)**
  - A session starts when you navigate to the session route:
    - `freestyle`: starts a session with no routine
    - `<routineId>`: starts a session prefilled with that routine’s exercises
    - `active`: resumes an existing active session (if any)
- **Timer starts paused by default**
  - User taps **Start Workout** to begin timing
  - Timer can be paused/resumed
- **End session**
  - Manual “End Workout” action
  - Optional auto-end after inactivity (configurable)
- **Only one active session at a time**
  - No overlap
  - Resume is supported (including after app kill)

---

## 3.2 Logging model (current UI)

### Core logging unit (today)

Each session contains:

- Exercise name (free text)
- Exercise completion (toggle)
- Exercise order (drag to reorder)

### Interaction rules (today)

- Add exercise = quick text add
- Complete exercise = one tap
- Reorder = drag-and-drop

### About sets (important)

Sets (reps/weight/timestamp) are part of the data model, but:

- ✅ the DB supports sets
- ❌ the set logging UI (add/edit/remove sets) is **not shipped yet**

---

## 3.3 Flexibility during execution

- Planned intent is **visible but passive**
- Logging is allowed even if:
  - no plan existed
  - the plan changed completely
  - exercises differ from the routine

Reality always wins.

---

# 4. Logging & Memory Module — *After the workout* (shipped)

### Purpose

Capture subjective context while it still exists.

---

## 4.1 Reflections (optional, encrypted)

Reflections can be added after ending a session (or later):

- Optional prompts:
  - “How did this feel?”
  - “Anything to note?”
- Free-text only
- Skippable without penalty

Implementation-aligned note: reflections are encrypted at rest.

---

## 4.2 Session history (shipped)

- Paginated list of past sessions
- Search (text query)
- Date range filtering
- Session detail view shows exercises (and sets if present)
- In-progress session management (resume/discard)

This is a **notebook**, not a report.

---

# 5. App Infrastructure Module — *The boring stuff that matters* (non-negotiable)

These are non-negotiable.

---

## 5.1 Offline-first

- App works with:
  - airplane mode
  - no login
  - no cloud dependency

Sync (if ever added) is:

- optional
- invisible
- never blocking

---

## 5.2 Data tolerance

- Partial logs are valid
- Empty sessions are valid
- Duplicate entries are allowed
- “Messy” data is not corrected automatically

No data shaming.

---

## 5.3 Performance & reliability

- App opens instantly
- No spinners on core flows
- Session state persists across app kill to support resume

If it lags in a gym basement, it failed.

---

## 5.4 Privacy

- No account required
- No analytics tracking
- No forced export in v1

The app assumes:

> “This is private training memory.”

---

# 6. Minimal Settings (very minimal)

Settings should fit on **one screen**.

Shipped/allowed:

- Auto-end session timeout (on/off)
- Session duration target
- Dark / light / system theme

Avoid:

- Preferences that create behavioral complexity

---

# 7. Explicit Non-Goals (print this and keep it visible)

This app will **not**:

- Coach
- Motivate
- Optimize
- Compare
- Judge
- Remind
- Visualize progress

It will:

- remember
- accept
- persist
- stay quiet

Routines exist, but they are **templates**, not “programming.”

---

# 8. Shipped vs Next (roadmap that matches reality)

### Shipped

1. Local data model + migrations
2. Today view (planned routines + freestyle start)
3. Routines CRUD + planned dates
4. Plan tab (weekly navigation + per-day routine list + completion indicators)
5. Session flow (explicit start, one active session, resume)
6. Timer (starts paused, start/pause/resume, target duration)
7. Auto-end session on inactivity (configurable)
8. History (pagination, search, date filtering, session detail)
9. Reflections (optional, encrypted)

### Next (implementation-aligned)

1. Set logging UI (add/edit/remove sets; carry-forward values)
2. Units (kg/lb) end-to-end in UI
3. Optional reflection prompt after ending (still skippable)
4. Calm exports (JSON/CSV) — only if it stays offline-first and non-invasive