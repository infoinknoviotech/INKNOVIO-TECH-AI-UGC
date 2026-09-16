---
name: Cybernetic Luminescence
colors:
  surface: '#10131c'
  surface-dim: '#10131c'
  surface-bright: '#363942'
  surface-container-lowest: '#0b0e16'
  surface-container-low: '#181b24'
  surface-container: '#1c1f28'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#e0e2ee'
  on-surface-variant: '#b9cac4'
  inverse-surface: '#e0e2ee'
  inverse-on-surface: '#2d3039'
  outline: '#84948f'
  outline-variant: '#3a4a46'
  surface-tint: '#00dfc1'
  primary: '#beffee'
  on-primary: '#00382f'
  primary-container: '#00f0d0'
  on-primary-container: '#00695a'
  inverse-primary: '#006b5c'
  secondary: '#bfc6db'
  on-secondary: '#293041'
  secondary-container: '#41495a'
  on-secondary-container: '#b1b8cd'
  tertiary: '#bdfff2'
  on-tertiary: '#003731'
  tertiary-container: '#62ebd7'
  on-tertiary-container: '#00685d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#30fddd'
  primary-fixed-dim: '#00dfc1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005145'
  secondary-fixed: '#dbe2f8'
  secondary-fixed-dim: '#bfc6db'
  on-secondary-fixed: '#141c2b'
  on-secondary-fixed-variant: '#3f4758'
  tertiary-fixed: '#71f8e4'
  tertiary-fixed-dim: '#4fdbc8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#10131c'
  on-background: '#e0e2ee'
  surface-variant: '#31353e'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4.5rem
  space-4xl: 6rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  container-max: 1240px
---

## Brand & Style

This design system embodies hyper-modern digital agency sophistication: high-precision engineering fused with luminous creative craft. Inspired by deep cosmic obsidian substrates illuminated by electric bioluminescent teal and cyan currents, the interface speaks directly to enterprise innovators, digital transformation leaders, and high-growth technology startups.

The aesthetic fuses **Glassmorphism** with **Futuristic Minimalist Dark Mode**. The atmospheric mood is quiet, authoritative, and frictionless, punctuated by radiant cyan accents that guide attention with laser clarity. Surfaces do not feel flat; instead, they exist as layered smoked crystal panels hovering over an infinite deep-space canvas, conveying cutting-edge capability, digital mastery, and effortless prestige.

## Colors

The palette is engineered around high luminance contrast against deep, ink-tinted midnight voids:

- **Primary (`#00F0D0`)**: Electric Cyber Cyan. Used for focal call-to-actions, primary state transitions, active progress indicators, and radiant signature glows.
- **Secondary (`#0d1524`)**: Midnight Navy Surface. A deep blue-gray tint employed across cards, containers, input backdrops, and navigation panels.
- **Tertiary (`#14b8a6`)**: Deep Emerald Teal. Used to anchor gradients, secondary badges, interactive hover states, and supporting metadata highlights.
- **Neutral Background (`#060911`)**: Deep Obsidian Void. The infinite backdrop base that absorbs ambient light and allows electric elements to float with maximum pop.

### Color Tokens & Transparency Spectrum
- **Canvas Base**: `#060911` (gradient blends downward into `#090e19`)
- **Surface Elevation 1**: `rgba(13, 21, 36, 0.72)` with `backdrop-filter: blur(16px)`
- **Surface Elevation 2**: `rgba(18, 28, 48, 0.85)`
- **Border Subtle**: `rgba(0, 240, 208, 0.12)`
- **Border Active/Hover**: `rgba(0, 240, 208, 0.45)`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#94A3B8` (Slate 400)
- **Text Muted**: `#475569` (Slate 600)
- **Glow Ambient**: `rgba(0, 240, 208, 0.15)`

## Typography

The typographical pairing unites tech-forward character with high-efficiency legibility:

- **Space Grotesk** is chosen for headlines, metric callouts, and interactive labels. Its geometric, slightly mechanistic proportions capture the digital transformation angle and resonate with the fountain-pen-circuit motif of the brand.
- **Plus Jakarta Sans** provides a warm, ergonomic balance for body copy, micro-descriptions, and form inputs. Its open apertures prevent reading fatigue against deep dark backgrounds.

All uppercase kicker labels (e.g., `+ WE BUILD DIGITAL EXCELLENCE`) must feature expanded letter spacing (`letter-spacing: 0.08em` to `0.1em`) to create clean structural alignment across headers.

## Layout & Spacing

This design system uses a 12-column fluid grid system pinned to a maximum container width of `1240px` with responsive adaptations:

- **Desktop (1024px+)**: 12 columns, `24px` gutter, `32px` outer padding. Modular content blocks span 3, 4, 6, or 12 units.
- **Tablet (768px - 1023px)**: 8 columns, `20px` gutter, `24px` outer padding. 4-column cards stack into 2-column pairs.
- **Mobile (320px - 767px)**: 4 columns, `16px` gutter, `16px` outer margin. Multi-column structures collapse into a singular vertical flow.

Spacing scales on a strict 4px/8px rhythm. Generous vertical section padding (`space-3xl` to `space-4xl`) creates an airy, editorial presentation where key visual artifacts (such as glowing digital mesh graphics) command dramatic presence.

## Elevation & Depth

Visual hierarchy does not rely on opaque dropshadows. Instead, elevation is expressed through **luminescent glass layering**, luminous edge diffusion, and variable surface opacity:

- **Elevation 0 (Canvas Base)**: `#060911` with occasional radial background gradient overlays of `radial-gradient(circle at top right, rgba(0, 240, 208, 0.08), transparent 60%)`.
- **Elevation 1 (Cards & Sidebars)**: `rgba(13, 21, 36, 0.65)` background, `backdrop-filter: blur(20px)`, framed by a crisp border `1px solid rgba(0, 240, 208, 0.1)`. Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.45)`.
- **Elevation 2 (Floating Modals & Active Cards)**: `rgba(18, 28, 48, 0.85)`, framed by `1px solid rgba(0, 240, 208, 0.28)`. Shadow: `0 16px 48px 0 rgba(0, 0, 0, 0.65), 0 0 24px 0 rgba(0, 240, 208, 0.12)`.
- **Elevation 3 (Primary CTAs & Glow Rings)**: Solid `#00F0D0` fill emitting an ambient aura: `box-shadow: 0 0 20px rgba(0, 240, 208, 0.4), 0 0 40px rgba(0, 240, 208, 0.15)`.

## Shapes

The shape system adopts modern geometric precision with medium roundedness (`0.5rem` base, scaling to `1rem` on cards). This maintains structural rigor without feeling abrasive:

- **Cards & Modal Containers**: `1rem` (`16px`) radius for a polished, architectural silhouette.
- **Buttons & Chips**: `0.5rem` (`8px`) to full pill (`9999px`) for specialized badges and kicker tags.
- **Form Controls & Inputs**: `0.5rem` (`8px`) radius to match button geometry.
- **Micro UI (Checkboxes, Toggles)**: `0.25rem` (`4px`) inner corner curvature.

## Components

### Buttons
- **Primary Button**: Solid vibrant cyan fill (`#00F0D0`) with obsidian text (`#060911`), bold `Space Grotesk` label, and subtle inner edge highlight. Hover state triggers an energized glow (`box-shadow: 0 0 24px rgba(0, 240, 208, 0.5)`) and slight upward translation (`-1px`).
- **Secondary / Outline Button**: Smoked glass background (`rgba(13, 21, 36, 0.4)`), text in `#FFFFFF`, framed with a `1px solid rgba(0, 240, 208, 0.3)` border. On hover, the border transitions to `#00F0D0` and background opacity rises to `0.8`.
- **Text / Arrow Button**: Inline `Space Grotesk` text in `#00F0D0` accompanied by an inline chevron or arrow that translates `4px` to the right on hover.

### Cards & Service Tiles
- Structured on `rgba(13, 21, 36, 0.7)` frosted backdrop with `1px solid rgba(0, 240, 208, 0.12)` border.
- Features top-corner icon badges enclosed in soft cyan-tinted rounded squares (`rgba(0, 240, 208, 0.08)` fill with `1px solid rgba(0, 240, 208, 0.2)`).
- On hover, cards transition their border to `rgba(0, 240, 208, 0.35)` with an ambient cyan underglow.

### Form Inputs & Textareas
- Deep midnight fill (`rgba(10, 16, 28, 0.8)`), inset padding `14px 18px`, text in pure white (`#FFFFFF`), and placeholder in Slate 500 (`#64748B`).
- Default border: `1px solid rgba(255, 255, 255, 0.08)`.
- Focused state: Border brightens to `#00F0D0` accompanied by a soft focus ring (`box-shadow: 0 0 0 3px rgba(0, 240, 208, 0.15)`).

### Metric Counter & KPI Blocks
- Headline numbers rendered in `display-hero` Space Grotesk in `#00F0D0` or bright `#FFFFFF`, followed by a sub-label in muted Slate (`#94A3B8`).

### Status Badges & Chips
- Compact pill geometries (`border-radius: 9999px`) utilizing low-opacity teal backgrounds (`rgba(0, 240, 208, 0.08)`), a subtle border (`rgba(0, 240, 208, 0.2)`), and glowing `label-sm` text. Often preceded by a pulsing `6px` radial dot.

### Navigation & Header
- Sticky dark glass container with `backdrop-filter: blur(24px)`, border-bottom `1px solid rgba(255, 255, 255, 0.06)`, and cyan highlight indicators on active menu items.