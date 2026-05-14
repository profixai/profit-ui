## Goal
As the user types in any inventory notes textarea, collapse runs of whitespace into a single space so the visible value, component state, and autosaved draft never contain double spaces.

## Change
Single edit in `src/pages/Inventory.tsx`, inside `setVal`:

- When `field === "notes"`, normalize the incoming value before calling `setValues`:
  - Replace any run of whitespace characters (`/\s+/g`) with a single ASCII space.
  - If the result is a single space (i.e. the user has only typed whitespace), store `""` instead so the field appears empty and the autosave `hasContent` check skips it.
- `amount` handling stays unchanged.

Because the textarea is controlled by `values[dept][line].notes`, the normalized value is what the user sees — double spaces visually collapse on the next keystroke, and tabs/newlines pasted in are flattened to single spaces.

## Trade-offs
- The user cannot type two spaces in a row; the second space is swallowed immediately. This is the intended behavior per the request.
- Pasted multi-line notes become a single line. Acceptable for short operational notes (≤280 chars).

## Out of scope
- `handleSaveDraft`, `handleSubmit`, autosave effect — already trim and will continue to work on the already-normalized value.
- No contract or test changes.

## Verification
- Type "hello   world" → field shows "hello world".
- Paste "a\t\tb\nc" → field shows "a b c".
- Type only spaces → field stays empty; nothing written to localStorage for that line.
