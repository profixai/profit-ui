

## Integration icons — centralize behavior, clean up duplicates

### Current state
- **Sidebar footer**: Static "Telegram connected" text with green dot — not clickable
- **Settings page**: Telegram section with status + external link to `t.me`
- **TopBar**: No Telegram or WhatsApp icons currently exist
- **No WhatsApp references** anywhere in the codebase

### Plan

**1. Create `src/hooks/useIntegrationNavigation.ts`**
- Export `goToTelegramIntegration()` — calls `useNavigate()` to `/settings#telegram`
- Single source of truth for all Telegram click targets

**2. Update Settings page (`src/pages/Settings.tsx`)**
- Add `id="telegram"` to the Telegram section so the hash anchor works
- Merge Telegram into the Integrations section (single unified block) with PMS/POS/Accounting cards
- On mount, if `location.hash === '#telegram'`, scroll the Telegram card into view

**3. Update Sidebar footer (`src/components/AppSidebar.tsx`)**
- Make the "Telegram connected" indicator clickable using the shared hook
- When collapsed, show just the green dot as a clickable icon

**4. Add integration icons to TopBar (`src/components/TopBar.tsx`)**
- Add a small Telegram icon (from `lucide-react` `Send` icon or inline SVG) next to the bell, using the shared `goToTelegramIntegration` handler
- No WhatsApp icon — omit entirely until supported (cleanest approach)

**5. No other changes**
- No modals, no external links from icons — just in-app navigation to Settings

### Files to create/edit
| File | Action |
|---|---|
| `src/hooks/useIntegrationNavigation.ts` | Create — shared navigation hook |
| `src/components/TopBar.tsx` | Edit — add Telegram icon button |
| `src/components/AppSidebar.tsx` | Edit — make footer clickable |
| `src/pages/Settings.tsx` | Edit — add `id="telegram"`, scroll-into-view on hash |

