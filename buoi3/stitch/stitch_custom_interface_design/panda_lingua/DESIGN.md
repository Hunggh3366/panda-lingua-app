---
name: Panda Lingua
colors:
  surface: '#FFFFFF'
  surface-dim: '#d1dbe9'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e4effd'
  surface-container-high: '#dfe9f7'
  surface-container-highest: '#d9e3f1'
  on-surface: '#121c26'
  on-surface-variant: '#43474f'
  inverse-surface: '#27313c'
  inverse-on-surface: '#e8f2ff'
  outline: '#747780'
  outline-variant: '#c3c6d0'
  surface-tint: '#3f5f92'
  primary: '#002550'
  on-primary: '#ffffff'
  primary-container: '#173b6c'
  on-primary-container: '#87a6de'
  inverse-primary: '#a9c7ff'
  secondary: '#006c44'
  on-secondary: '#ffffff'
  secondary-container: '#93f7bf'
  on-secondary-container: '#007349'
  tertiary: '#3d1d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#5d2f00'
  on-tertiary-container: '#da965f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#254778'
  secondary-fixed: '#93f7bf'
  secondary-fixed-dim: '#77daa4'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#005232'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77e'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6b3a0a'
  background: '#F7FAF8'
  on-background: '#121c26'
  surface-variant: '#d9e3f1'
  muted-text: '#64717D'
  danger: '#C94A4A'
  border: '#DCE4E1'
  primary-dark: '#102B50'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1200px
  gutter: 16px
---

## Brand & Style

The design system is built to evoke a sense of **friendliness, clarity, and motivation**. Designed primarily for beginners learning Chinese (HSK 1–2), the interface prioritizes low cognitive load and high encouragement. 

The aesthetic is **Modern Corporate with a Playful Twist**, blending the reliability of structured layouts with the warmth of rounded geometry and character-driven illustrations (the Panda). We avoid dashboard clutter, opting for a clean, focus-oriented environment that directs the user toward a single primary action: starting their daily lesson.

- **Tone:** Encouraging, patient, and systematic.
- **Visual Mood:** Bright and airy, using "soft-tech" elements like gentle shadows and generous whitespace to make the learning process feel manageable.

## Colors

The palette is anchored by **Navy Blue** (Trust & Depth) and **Leaf Green** (Growth & Success). 

- **Primary (#173B6C):** Reserved for high-priority navigation, headers, and core brand identity.
- **Secondary (#4CAF7D):** Used for "Success" states, progress indicators, and positive reinforcement. It signals advancement and correct answers.
- **Background (#F7FAF8):** A tinted, off-white "mint-cream" that reduces eye strain compared to pure white, providing a soft canvas for learning.
- **Surface (#FFFFFF):** Used for cards and interactive components to create a clear "lift" from the background.
- **Text:** High-contrast Navy-Black for primary legibility, with a softer Slate Gray for metadata and secondary descriptions.

## Typography

This design system utilizes **Inter** for all roles to ensure maximum legibility and a clean, neutral character that doesn't distract from Chinese characters (Hanzi).

- **Hierarchy:** We use bold weights for headlines to create a strong sense of place and progress. 
- **Body Text:** Standardized at 16px for optimal mobile reading.
- **Labels:** Used for buttons and micro-copy, utilizing a slightly heavier weight (Medium/Semi-Bold) to ensure they stand out as interactive elements.
- **Character Support:** Ensure the font stack includes a fallback for Noto Sans SC to properly render HSK vocabulary cards.

## Layout & Spacing

This design system follows a **Mobile-First Fluid Grid** that transitions into a **Fixed Container** on desktop.

- **Mobile (Default):** A single-column layout with 16px side margins. Elements are stacked vertically to prioritize the "one-decision-per-screen" rule.
- **Desktop:** The content is centered within a 1200px max-width container. Supplementary information (like SRS progress or weekly stats) can be placed in side rails, but the core learning "Vocabulary Card" remains the focal point.
- **Spacing Rhythm:** Based on a 4px baseline. Use 16px (md) for standard padding within cards and 24px (lg) for vertical section spacing.

## Elevation & Depth

We use **Tonal Layers** combined with **Ambient Shadows** to create a sense of hierarchy without adding visual noise.

- **Level 0 (Background):** `#F7FAF8` — The base canvas.
- **Level 1 (Cards):** `#FFFFFF` surface with a very soft, diffused shadow (`0px 4px 12px rgba(23, 59, 108, 0.05)`). This creates a "friendly" lift.
- **Level 2 (Interactive/Floating):** Used for primary buttons or active quiz selections. These use a slightly more pronounced shadow to indicate "pressability."
- **Outlines:** A thin 1px border (`#DCE4E1`) is used on all Level 1 surfaces to maintain definition on high-brightness screens.

## Shapes

The shape language is **Rounded**, reflecting the friendly and approachable brand persona.

- **Standard Radius:** 0.5rem (8px) for buttons, inputs, and small controls.
- **Card Radius (rounded-lg/xl):** 12px to 16px. This "softer" cornering is critical for the "Vocabulary Card" and "Today Summary" sections to make the content feel inviting rather than institutional.
- **Icons:** Must use rounded caps and joins to match the typography and container language.

## Components

### Buttons
- **Primary:** Solid Navy (`#173B6C`) with white text. High-contrast, rounded (8px). 
- **Secondary:** Outlined with Primary color or solid Green (`#4CAF7D`) for "Continue" actions.
- **States:** Hover/Pressed states should darken the background by 10%. Disabled states use `#DCE4E1` with muted text.

### Vocabulary Cards
- White background, 16px padding, 16px radius.
- Features large-scale Hanzi (Center) with Pinyin and translation hidden or revealed via interaction.
- Minimal decoration to maintain focus.

### Progress Indicators
- Linear bars using `#4CAF7D` on a `#DCE4E1` track. 
- Always accompanied by text (e.g., "7/20 từ") to ensure accessibility.

### Quiz Options
- Large, touch-friendly tiles. 
- **Selected:** 2px Navy border with a light blue tint.
- **Correct:** 2px Green border with light green background.
- **Incorrect:** 2px Red border with light red background.

### Panda Illustrations
- Used as a "Learning Coach." 
- **Success:** Panda cheering for lesson completion.
- **Empty State:** Panda sleeping or waiting for the user to start.
- **Instructional:** Panda pointing toward the next primary CTA.