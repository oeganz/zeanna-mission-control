# Mission Control — Ticket Board & Dashboard Spec

**Context:** Custom Zeanna deployment for Ganz's AI agent operations.
Based on: `https://github.com/abhi1693/openclaw-mission-control` (upstream, synced to `75eb8b0`)

---

## What Already Exists

### Sidebar (`frontend/src/components/organisms/DashboardSidebar.tsx`)
- Full sidebar with: Dashboard, Live Feed, Boards, Board Groups, Tags, Approvals, Custom Fields, Marketplace, Packs, Organization, Gateways, Agents
- Already linked to `/dashboard`, `/activity`, `/boards`, etc.
- **No changes needed** — this is the nav bar

### Board Detail Page (`frontend/src/app/boards/[boardId]/page.tsx`)
- Full kanban board: inbox → in_progress → review → done
- Task creation, editing, comments, live feed
- Board chat, agent control (`/pause`, `/resume`)
- Approvals panel
- SSE streaming for live updates
- **This IS the ticket board** — already working, no changes needed

### Dashboard (`frontend/src/app/dashboard/page.tsx`)
- Upstream dashboard with metrics, agents, boards, activity
- **Goal: replace with a simpler "empty" dashboard** per Ganz's request

---

## What Needs to Be Built

### 1. New Dashboard Page — Empty/Placeholder Shell

**File:** `frontend/src/app/dashboard/page.tsx`

**Purpose:** A clean landing page for the mission control, showing system status and quick links without the full upstream metrics complexity.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  [Sidebar]  │  Dashboard                         │
│             │                                    │
│  Dashboard  │  Welcome back                      │
│  Live feed  │  [Quick stats row]                 │
│  Boards     │                                    │
│  Board grps │  [Empty state or placeholder]     │
│  Tags       │                                    │
│  ...        │                                    │
└─────────────────────────────────────────────────┘
```

**Quick stats row (4 cards):**
- Total Boards
- Total Agents
- Pending Approvals
- System Status (from existing health endpoint)

**Empty state design:**
- Centered icon (e.g., `BarChart3` or `LayoutDashboard` from lucide)
- Heading: "Your dashboard is ready"
- Subtext: "Connect your first board to start tracking tickets"
- CTA button: "Go to Boards" → links to `/boards`

**Tech requirements:**
- Use existing `DashboardShell` and `DashboardSidebar` components
- Use existing `useHealthzHealthzGet` for system status
- Use existing API hooks (`useListBoardsApiV1BoardsGet`, `useListAgentsApiV1AgentsGet`, etc.)
- Same auth pattern as other pages (`useAuth` from `@/auth/clerk`)
- Responsive, matches existing design system (Tailwind, shadcn/ui components)

### 2. Optional: Rename "Boards" Nav Item to "Tickets"

In `DashboardSidebar.tsx`, the "Boards" nav item links to `/boards`. Since Ganz calls them "tickets":

**Change in `DashboardSidebar.tsx`:**
```tsx
// Change:
<LayoutGrid className="h-4 w-4" />
Boards

// To:
<TicketIcon className="h-4 w-4" />
Tickets
```

Note: Import `Ticket` from `lucide-react` instead of or in addition to `LayoutGrid`.

**This is optional** — only do if Ganz confirms.

---

## Implementation Notes

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI components:** shadcn/ui
- **Icons:** lucide-react
- **API:** Auto-generated from OpenClaw backend via Orval
- **Auth:** Clerk (`@/auth/clerk`)

### Existing Components to Reuse
- `DashboardShell` (`@/components/templates/DashboardShell`)
- `DashboardSidebar` (`@/components/organisms/DashboardSidebar`)
- `useHealthzHealthzGet` — system health
- `useListBoardsApiV1BoardsGet` — board list
- `useListAgentsApiV1AgentsGet` — agent list
- Button, Card components from `@/components/ui/`

### File Locations
```
frontend/src/app/dashboard/page.tsx   ← new empty dashboard
frontend/src/components/organisms/DashboardSidebar.tsx  ← optional rename
```

### API Endpoints (from generated client)
- `GET /api/v1/metrics/dashboard` — dashboard metrics (optional, can skip for empty dashboard)
- `GET /api/v1/gateways/status` — gateway status
- `GET /api/v1/healthz` — system health
- `GET /api/v1/boards` — board list
- `GET /api/v1/agents` — agent list

---

## Out of Scope

- Any backend changes
- Changes to the kanban board (`/boards/[boardId]/page.tsx`)
- Changes to the existing sidebar structure
- User authentication changes
- Custom fields, webhooks, or approval logic

---

## Success Criteria

1. Dashboard page renders at `/dashboard` with sidebar nav
2. Shows 4 quick-stat cards (boards, agents, approvals, system status)
3. Empty state displayed prominently with CTA to boards
4. Page is responsive and matches existing design language
5. No console errors, loads under 2s
6. Sidebar correctly highlights "Dashboard" when on that route