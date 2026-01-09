# Workout Screen Issues to Address
* When the user taps the timer on the workout screen, a time picker bottom sheet opens. However, this bottom sheet does not currently align with our design system. Please update it to fully match our styling guide, ensuring visual consistency in both light and dark modes.

* When a user selects a duration from the time picker, any existing timer must be fully reset and restarted based on the newly selected time. The timer should always start fresh from the selected value. Please review and fix the current timer logic, as this behavior is not working correctly.

* In light mode, the tab bar is rendering with dark-mode styling. Please fix this so the tab bar correctly reflects the active theme.

* In the Today tab:
  When a workout is started and the user navigates away (for example, via the in-workout code flow) and then returns to the Today tab, the app shows a “Session in progress” state. This is expected **only** if the session was interrupted unintentionally (app closed, backgrounded, or navigated away).
  If the user manually ends the workout, the “Session in progress” section should never appear. Please update the session state logic accordingly.

* In the Plan tab, when a routine is created with multiple exercises and the user taps “Start Routine,” there are scenarios where the added exercises do not appear. Please investigate whether any state, persistence, or data-mapping step is missing.

* On the workout screen, after tapping “Start Routine” and landing on the active workout screen, adding exercises results in the exercise name and hamburger icon stacking in a single column. These should be laid out horizontally in a row.
  Please use the Create Routine / Edit Routine implementation in the Plan tab as the reference for correct layout behavior.

* Timer behavior must be fully deterministic and reset-based:

  * If the user has set a default workout duration (e.g., 60 minutes) in Settings, starting any routine should begin with that duration.
  * If the user changes the timer mid-session (for example, from 60 minutes to 30 minutes after 5 minutes have elapsed), the timer must reset and start from 30 minutes.
  * If the user switches back to 60 minutes, the timer must again reset and start from 60 minutes—not resume from any previous elapsed state.
    The timer should **always** restart from the newly selected value. This is currently not working and needs correction.

* The workout screen’s primary purpose is to clearly show:

  * the current exercise
  * the next exercise
  * completion state
  * the active timer
    Please strengthen the visual hierarchy of this section so it remains bold, readable, and clearly visible in both light and dark modes. Text contrast—especially for the exercise timer—must be high and legible in all conditions.


