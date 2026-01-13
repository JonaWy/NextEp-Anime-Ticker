# Chrome Extension Design Guide

**Design System:** shadcn/ui  
**Theme:** Amber Minimal (tweakcn)  
**Environment:** Cursor

---

## 1. Design Principles

- **Minimal first**: Reduce visual noise. Prefer whitespace over borders.
- **Amber as accent**: Use amber sparingly to guide attention (primary actions, highlights).
- **System-native feel**: Chrome extensions should feel lightweight and fast.
- **Accessibility by default**: Contrast, focus states, keyboard navigation.

---

## 2. Color System

### Core Palette
- **Primary (Amber):** Used for CTAs, toggles, active states
- **Background:** Neutral / near-white in light mode, near-black in dark mode
- **Foreground:** High-contrast neutral text
- **Muted:** Secondary text, helper labels
- **Border / Ring:** Very subtle, avoid heavy outlines

### Usage Rules
- Only **one primary action per view**
- Never use amber for destructive actions
- Prefer `muted-foreground` over lowering opacity

---

## 3. Typography

- **Font:** Default shadcn (Inter / system-ui)
- **Hierarchy:**
  - Page title: `text-base font-semibold`
  - Section title: `text-sm font-medium`
  - Body text: `text-sm`
  - Helper text: `text-xs text-muted-foreground`

### Guidelines
- Avoid large headings — Chrome extension UIs are compact
- Line height should feel relaxed but dense

---

## 4. Layout & Spacing

### Container
- Max width: **360–420px** (popup-friendly)
- Padding: `p-3` or `p-4`

### Spacing Scale
- Between sections: `space-y-4`
- Between controls: `space-y-2`
- Group related items using cards or subtle dividers

---

## 5. Components (shadcn)

### Buttons
- **Primary:** Amber background, used once per view
- **Secondary:** Ghost or outline
- **Destructive:** Neutral red, never amber

**Rules:**
- Prefer `size="sm"`
- Avoid full-width unless it’s a main action

### Inputs
- Use clear labels (not placeholders only)
- Inputs should feel calm — no strong borders
- Always show focus state

### Switch / Toggle
- Default to OFF
- Amber indicates active/ON state

### Cards
- Use for grouping only
- Minimal shadow or none
- Rounded but subtle (`rounded-lg`)

---

## 6. States

### Hover
- Slight background tint
- No dramatic animations

### Focus
- Visible ring using theme ring color
- Never remove focus styles

### Disabled
- Reduce contrast, not opacity to zero
- Cursor should remain default (not `not-allowed` unless necessary)

---

## 7. Icons

- Use **lucide-react** icons
- Size: `h-4 w-4`
- Pair icons with text for clarity
- Never rely on color alone to communicate meaning

---

## 8. Motion

- Keep animations under **150ms**
- Use only for:
  - Toggle feedback
  - Small state transitions
- Avoid layout-shifting animations

---

## 9. Dark Mode

- Must be fully supported
- No pure black — use dark neutral background
- Amber should be slightly desaturated in dark mode

---

## 10. Chrome Extension UX Rules

- User should understand the UI in **<3 seconds**
- No onboarding screens — inline hints only
- Persist state instantly (no save buttons)
- Errors should be calm, short, and actionable

---

## 11. Cursor Workflow Tips

- Keep this file open as a **design contract**
- When generating components, always ask:
  > “Does this respect the Amber Minimal theme and Chrome constraints?”

- Prefer composition over custom styling
- If unsure, choose the simpler variant

---

**Source Theme:** Amber Minimal (tweakcn)  
**Component Base:** shadcn/ui

This guide is the single source of truth for UI decisions in this extension.

