# Design System

<!-- impeccable:design-schema 1 -->

## Register

product

## Color Strategy

Restrained — neutrals with one indigo accent. Light mode uses cool slate backgrounds; dark mode uses deep slate surfaces with lighter indigo accents.

## Palette (Light)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#F8FAFC` | Page ground |
| `--foreground` | `#0F172A` | Body text |
| `--surface` | `#FFFFFF` | Panels, cards |
| `--theme-primary` | `#4338CA` | Primary actions, brand |
| `--color-secondary` | `#475569` | Muted text |
| `--color-accent` | `#7C3AED` | Highlights |

## Palette (Dark)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0F172A` | Page ground |
| `--foreground` | `#F8FAFC` | Body text |
| `--surface` | `#1E293B` | Panels |
| `--theme-primary` | `#818CF8` | Primary actions |
| `--color-secondary` | `#94A3B8` | Muted text |
| `--color-accent` | `#A78BFA` | Highlights |

## Typography

- **Font:** Inter (400, 500, 600, 700)
- **Display headings:** max `-0.03em` letter-spacing, `text-wrap: balance`
- **Body:** max 65–75ch line length in prose blocks
- **Scale:** MUI typography variants + Tailwind utilities

## Layout

- Max content width: `max-w-5xl` (PageContainer)
- Spacing rhythm: 4/6/8 Tailwind scale
- Panels: 16px border-radius, 1px border, subtle shadow — no nested cards

## Components

- **MUI:** interactive controls (Button, Chip, Stack, Typography)
- **Tailwind:** layout, spacing, utility classes
- **Shared primitives:** `src/components/ui/` (PageContainer, SubmitButton)

## Motion

- Subtle hover lift on primary buttons (`-translate-y-0.5`)
- `prefers-reduced-motion: reduce` disables animations
- No bounce or elastic easing

## Anti-patterns

- No purple-to-blue gradient heroes
- No Inter-as-display with generic centered hero
- No nested card-in-card layouts
- No gray muted body text below 4.5:1 contrast
