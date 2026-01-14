This **Core Implementation Plan** translates the product vision into a technical roadmap for building the History tab.

---

### **1. Feature Module Architecture**
Create a new feature module: history
*   **`types.ts`**: Define interfaces for `SessionHistoryItem` (a session with its exercises and reflection data).
*   **store.ts**: Implement `useHistoryStore` using Zustand.
    *   **State**: `sessions` (array), `isLoading` (bool), `hasMore` (bool).
    *   **Actions**: `loadSessions(offset)` for paginated fetching; `refreshHistory()` to reset and fetch the latest.
*   **index.ts**: Public API for the module.

### **2. Routing & Navigation**
*   **Tab Replacement**: Replace the existing routines.tsx with `app/(tabs)/history.tsx` (as per the decision to drop the Routine tab).
*   **Detail Screen**: Create `app/history/[id].tsx` as a stack screen (drilling down from the list).
*   **Tabs Layout**: Update _layout.tsx to update the icon (e.g., `book-outline` or `time-outline`) and label to **History**.

### **3. Data Layer (Drizzle/SQLite)**
*   **Query Strategy**: Use Drizzle’s Relational API for clean fetching:
    ```typescript
    db.query.sessions.findMany({
      with: { exercises: true, reflection: true },
      orderBy: [desc(sessions.date)],
      limit: 20,
      offset: X,
    })
    ```
*   **Performance**: Verify that `idx_sessions_date` and `idx_exercises_session_id` are active (already defined in index.ts).

### **4. UI Component Breakdown**

#### **A. History List (`app/(tabs)/history.tsx`)**
*   **`FlatList`**: Use for performance with pagination.
*   **`HistoryRow` Component**: 
    *   Large date (e.g., "Jan 12").
    *   Subtle intent label (e.g., "Full Body Push").
    *   Summary string: `"3 exercises • 12 sets"`.
    *   Small dot/icon if a reflection exists.
*   **`EmptyHistory`**: A simple `View` with centered, de-emphasized text.

#### **B. Session Detail (`app/history/[id].tsx`)**
*   **Header Section**: Calm typography showing full date and session duration (calculated from start/end times).
*   **Exercise List**: 
    *   Map through `exercises` and their associated `sets`.
    *   **`HistorySetRow`**: A read-only, compact version of the set log (e.g., "100kg x 10").
*   **Reflection Card**: A `Card` component displaying the "Feeling" (if any) and "Notes".

### **5. Behavior & Interaction Rules**
*   **Read-Only by Default**: No inputs, buttons, or checkboxes visible in the history view.
*   **Lazy Loading**: Use `onEndReached` in the `FlatList` to fetch the next batch of 20 sessions only when the user scrolls to the bottom.
*   **Instant Navigation**: Ensure the transition from List to Detail feels immediate; since the history is local-only, we skip loading spinners where possible.

### **6. Implementation Steps (Logical Order)**
1.  **Refactor Navigation**: Rename "Routines" tab to "History" and update icons.
2.  **Define Types & Store**: Set up the `history` feature folder and state management.
3.  **Build List UI**: Create the `HistoryRow` and connect the `FlatList` to the database.
4.  **Build Detail UI**: Create the `SessionDetail` screen to display full exercise/set logs.
5.  **Integrate Reflections**: Ensure reflections are fetched and displayed at the bottom of the Detail screen.
6.  **Polish Styling**: Apply the semantic design tokens from global.css (e.g., `text-light-text-secondary`, `bg-light-surface`).