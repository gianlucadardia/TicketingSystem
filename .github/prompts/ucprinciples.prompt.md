---
name: ucprinciples
description: Describe when to use this prompt
---

<!-- Tip: Use /create-prompt in chat to generate content with agent assistance -->

You are a senior UX/UI Designer + Frontend Architect expert in modern web applications (2026 standards).

Your task is to redesign and improve a Ticket Management Web Application UI, currently implemented as a basic CRUD interface, transforming it into a modern, clean, enterprise-grade experience focused on usability, performance, and scalability.

--------------------------------------------------
🎯 CONTEXT
--------------------------------------------------
The current application includes:
- A ticket list in a table layout
- Search bar
- Button to create a new ticket
- Modal form for creating tickets
- Fields: Title, Description, Competenza, Macro Causa, Causa, Stato, Priorità

Current problems:
- UI looks generic and lacks design identity
- Poor visual hierarchy
- Too data-oriented (database-like) rather than user-oriented
- Table is overloaded with controls (dropdowns, actions)
- No filtering system beyond basic search
- Form is too long and not optimized for usability
- No clear design system or component consistency
- Accessibility and performance improvements needed

--------------------------------------------------
🎯 DESIGN GOALS
--------------------------------------------------
Redesign the UI with the following objectives:

1. MODERN ENTERPRISE UX
- Clean, minimal, highly readable interface
- Action-oriented, not data-only
- Clear information hierarchy
- Reduce cognitive load

2. CONSISTENT DESIGN SYSTEM
- Define typography scale
- Define spacing system (8px-based)
- Define color system (primary, secondary, success, warning, danger)
- Convert all UI elements into reusable components

3. USER-CENTERED EXPERIENCE
- Optimize flows for real usage:
  - View tickets
  - Filter tickets
  - Create ticket quickly
- Reduce clicks and friction

4. PERFORMANCE-FIRST UI
- Avoid heavy rendering patterns (e.g., dropdowns inside table rows)
- Use lazy interactions instead of always-visible controls

5. ACCESSIBILITY (WCAG baseline)
- Proper contrast
- Keyboard navigation
- Visible focus states
- Accessible form labels

--------------------------------------------------
🎨 LAYOUT REQUIREMENTS
--------------------------------------------------

🔵 MAIN SCREEN (Ticket List)

Structure:

[Top Header]
- Left: Application title
- Right: User + logout

[Main Toolbar]
- Search input (wide)
- Filters (dropdowns or chips):
    - Stato
    - Priorità
    - Competenza
- CTA button: "Nuovo Ticket" (primary)

[Content Area]
- Table redesigned as:
  - Clean rows
  - Minimal inline controls
  - No dropdowns inside rows

Columns:
- Title (primary)
- Description (secondary text)
- Status (badge)
- Priority (badge)
- Date
- Actions (icon menu, not buttons)

Actions:
- Replace "Modifica + Elimina" buttons with:
    ⋮ (menu)
        - Modifica
        - Elimina

Pagination:
- Bottom right, minimal style

--------------------------------------------------
🟣 FORM (Create Ticket)

Convert modal into structured layout:

Layout:
- Group related fields (2 columns when possible)

Example:

----------------------------------
Titolo
Descrizione

Competenza      Priorità
Macro causa     Causa

Stato
----------------------------------

UX improvements:
- Disable "Causa" until "Macro causa" is selected
- Add helper text
- Inline validation messages
- Required fields clearly marked

Actions:
- Primary: "Crea"
- Secondary: "Annulla"

--------------------------------------------------
🎨 DESIGN SYSTEM SPECIFICATIONS
--------------------------------------------------

Use modern UI approach:

- Framework: Tailwind CSS or equivalent utility-first system
- Components:
    - Button (primary, secondary, ghost)
    - Badge (status, priority)
    - Input
    - Select
    - Modal
    - Table

Color system example:
- Primary: Blue (#2563eb)
- Success: Green
- Warning: Amber
- Danger: Red
- Background: very light gray

Spacing:
- 8px grid system

Typography:
- Clear hierarchy:
    - Title
    - Section
    - Body
    - Caption

--------------------------------------------------
⚡ PERFORMANCE GUIDELINES
--------------------------------------------------
- Avoid uncontrolled re-renders
- Extract reusable components:
    - TicketRow
    - StatusBadge
    - PriorityBadge
    - ActionsMenu
- Use memoization where appropriate
- Avoid heavy interactive elements inside tables

--------------------------------------------------
♿ ACCESSIBILITY
--------------------------------------------------
Ensure:
- Focus states visible
- Labels properly connected to inputs
- Keyboard navigation works for all elements
- Adequate color contrast for text and badges

--------------------------------------------------
📦 DELIVERABLE
--------------------------------------------------
Produce:

1. Redesigned UI layout description
2. Component breakdown
3. Example JSX/React structure
4. Suggested Tailwind styles
5. UX improvements explanation

--------------------------------------------------
🎯 FINAL GOAL
--------------------------------------------------
Transform the application from:
❌ basic CRUD tool

Into:
✅ modern, scalable, enterprise-ready UI
✅ clean, intuitive, and user-focused
✅ consistent and maintainable frontend architecture