---
name: frontend-reskin
description: Reskin proofshot's frontend to match objekt-maker's visual style. CSS and styling changes only — no backend/logic modifications. All existing functionality must remain intact.
---

# Proofshot Frontend Reskin — Objekt-Maker Style

This document specifies every CSS/styling change needed to make proofshot's frontend visually match objekt-maker. Changes are **strictly cosmetic** — no JavaScript logic, no HTML structure changes beyond what's needed for styling.

---

## 1. CSS Variables (`:root`)

**File:** `css/style.css` lines 5–34

Replace the entire `:root` block:

```css
:root {
    /* Color Palette — Objekt-Maker Dark Theme */
    --primary-color: #297aff;
    --primary-hover: #1f5fcc;
    --primary-light: rgba(41, 122, 255, 0.1);
    --secondary-color: #9200FF;
    --success-color: #22c55e;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --bg-color: #000000;
    --surface-color: #1a1a1a;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
    --border-color: #333333;

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 4px 16px 0 rgba(0, 0, 0, 0.7);

    /* Spacing */
    --spacing-xs: 0.5rem;
    --spacing-sm: 0.75rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;

    /* Border Radius — tighter than before */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;

    /* Transitions — snappier */
    --transition: all 0.15s ease;
}
```

### Key changes:
| Property | Old (proofshot) | New (objekt-maker) |
|---|---|---|
| `--primary-color` | `#c7b6f9` (purple) | `#297aff` (blue) |
| `--primary-dark` | `#a88ee6` | Renamed to `--primary-hover: #1f5fcc` |
| `--primary-light` | `#4a3f6b` | `rgba(41, 122, 255, 0.1)` |
| `--success-color` | `#6dd5a0` | `#22c55e` |
| `--danger-color` | `#ff6b9d` | `#ef4444` |
| `--bg-color` | `#1a1a1a` | `#000000` (pure black) |
| New: `--surface-color` | — | `#1a1a1a` (replaces old bg-color usage for panels) |
| `--bg-secondary` | `#2d2d2d` | Removed (use `--surface-color` instead) |
| `--text-primary` | `#e2e8f0` | `#ffffff` (pure white) |
| `--text-secondary` | `#a0aec0` | `#a0a0a0` |
| `--border-color` | `#3a3a3a` | `#333333` |
| `--radius-sm` | `8px` | `4px` |
| `--radius-md` | `12px` | `8px` |
| `--radius-lg` | `16px` | `12px` |
| Transition | `0.3s cubic-bezier` | `0.15s ease` (snappier) |

---

## 2. Font Family

**File:** `css/style.css` line 47

Add Google Font import at top of CSS file (before `:root`):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

Change `body` font-family:
```css
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: var(--bg-color);  /* pure black, no gradient */
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
```

### Key changes:
- Add `Inter` as primary font
- Background: Remove gradient, use flat `var(--bg-color)` (pure black)

---

## 3. Header

**File:** `css/style.css` lines 70–90

```css
.header {
    text-align: center;
    padding: var(--spacing-xl) var(--spacing-md);
    background: var(--surface-color);       /* was --bg-color */
    border-bottom: 1px solid var(--border-color);  /* was 5px solid --primary-light */
    box-shadow: none;                       /* was var(--shadow) */
}

.logo {
    font-size: 2rem;
    font-weight: 700;                      /* was 800 */
    color: var(--text-primary);            /* was --primary-color */
    margin-bottom: var(--spacing-xs);
    letter-spacing: -0.02em;               /* was -0.5px */
}

.tagline {
    font-size: 0.95rem;                    /* was 0.9rem */
    color: var(--text-secondary);
    font-weight: 400;                      /* was 500 */
}
```

### Key changes:
- Header background: `--surface-color` (#1a1a1a) instead of `--bg-color`
- Border: `1px solid` instead of `5px solid purple`
- Logo: white text instead of purple, weight 700
- No box-shadow on header

---

## 4. Toolbar / Sidebar

**File:** `css/style.css` lines 357–389

```css
.toolbar {
    background: var(--surface-color);       /* was --bg-color */
    border-radius: var(--radius-md);        /* was --radius-lg (now 8px instead of 16px) */
    border: 1px solid var(--border-color);  /* NEW — objekt-maker panels have border */
    box-shadow: none;                       /* was var(--shadow) */
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    position: relative;
}

.section-title {
    font-size: 0.875rem;                   /* was 0.85rem */
    font-weight: 600;                      /* was 700 */
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;                /* was 0.5px */
    margin-bottom: var(--spacing-xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}
```

### Key changes:
- Background: `--surface-color` instead of `--bg-color`
- Added `1px solid` border
- Removed box-shadow
- Tighter border-radius

---

## 5. Buttons

**File:** `css/style.css` lines 401–467

```css
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border-color);  /* was 5px solid */
    background: var(--surface-color);       /* was --bg-color */
    color: var(--text-primary);
    font-size: 0.875rem;                    /* was 0.9rem */
    font-weight: 600;
    border-radius: var(--radius-sm);        /* now 4px */
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
    min-height: 44px;
}

.btn:hover {
    background: var(--bg-color);            /* was --bg-secondary */
    border-color: var(--text-secondary);
    transform: translateY(-1px);            /* was -2px */
    box-shadow: none;                       /* was var(--shadow) */
}

.btn:active {
    transform: translateY(0);
}

.btn-primary {
    background: var(--primary-color);
    border-color: transparent;              /* was --primary-color */
    color: white;
}

.btn-primary:hover {
    background: var(--primary-hover);       /* was --primary-dark */
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(41, 122, 255, 0.3);  /* blue glow */
}

.btn-success {
    background: var(--success-color);
    border-color: transparent;              /* was --success-color */
    color: white;
}

.btn-success:hover {
    background: #1da34a;
    border-color: transparent;
}
```

### Key changes:
- Border: `1px` instead of `5px`
- Primary/Success buttons: `border-color: transparent` (no colored border, cleaner)
- Hover glow uses blue rgba instead of generic shadow
- Subtler translateY on hover (-1px instead of -2px)

---

## 6. Controls Section & Sliders

**File:** `css/style.css` lines 472–573

```css
.controls-section {
    background: var(--bg-color);            /* was --bg-secondary (#2d2d2d) → now pure black */
    padding: var(--spacing-md);
    border-radius: var(--radius-sm);        /* now 4px */
    border: 1px solid var(--border-color);  /* was 3px solid */
}

/* Range Slider Track */
input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;                            /* was 6px — thinner */
    background: var(--border-color);
    border-radius: 2px;
    outline: none;
    transition: var(--transition);
}

input[type="range"]:hover {
    background: var(--border-color);        /* was --primary-light — no color change on hover */
}

/* Slider Thumb — WebKit */
input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;                            /* was 18px — slightly smaller */
    height: 16px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-webkit-slider-thumb:hover {
    background: var(--primary-hover);
    transform: scale(1.1);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-webkit-slider-thumb:active {
    transform: scale(0.95);
}

/* Slider Thumb — Firefox */
input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--primary-color);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb:hover {
    background: var(--primary-hover);
    transform: scale(1.1);
}

input[type="range"]::-moz-range-thumb:active {
    transform: scale(0.95);
}
```

### Key changes:
- Controls section background: pure black instead of #2d2d2d
- Border: `1px` instead of `3px`
- Slider track: `4px` height instead of `6px`
- Slider thumb: `16px` instead of `18px`

---

## 7. Edit Mode Toggle (Photocard/Background)

**File:** `css/style.css` lines 250–300

This maps to objekt-maker's front/back view toggle. Restyle to match:

```css
.edit-mode-toggle {
    position: absolute;
    top: var(--spacing-md);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: var(--spacing-sm);                 /* was --spacing-xs */
    background: var(--bg-color);            /* was rgba(26,26,26,0.9) — now pure black */
    padding: 4px;
    border-radius: var(--radius-md);        /* now 8px */
    border: 1px solid var(--border-color);  /* NEW */
    box-shadow: none;                       /* was var(--shadow) */
    z-index: 10;
    backdrop-filter: none;                  /* was blur(10px) — cleaner */
    width: fit-content;
}

.edit-mode-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg);  /* was 8px 12px — wider */
    background: transparent;
    border: none;                           /* was 2px solid transparent */
    border-radius: var(--radius-sm);        /* now 4px */
    color: var(--text-secondary);
    font-size: 0.875rem;                    /* was 0.85rem */
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
    text-transform: uppercase;              /* NEW — matches objekt-maker */
    letter-spacing: 0.03em;                 /* NEW */
}

.edit-mode-btn:hover {
    background: rgba(255, 255, 255, 0.05);  /* was rgba(199,182,249,0.1) */
    color: var(--text-primary);              /* was --primary-color */
}

.edit-mode-btn.active {
    background: var(--primary-color);
    color: white;                            /* was #1a1a1a dark text */
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(41, 122, 255, 0.3);  /* blue glow */
}
```

### Key changes:
- Solid black background with border instead of frosted glass
- Buttons: uppercase, wider padding
- Active: white text on blue (was dark text on purple)
- Blue glow shadow on active state

---

## 8. Edit Mode Hint

**File:** `css/style.css` lines 302–346

```css
.edit-mode-hint {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    background: var(--primary-color);       /* now blue instead of purple */
    color: white;                           /* was #1a1a1a */
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: var(--shadow);
    animation: hintFadeInOut 3s ease-in-out forwards;
    pointer-events: none;
    z-index: 11;
}

.edit-mode-hint::after {
    content: '';
    position: absolute;
    bottom: 100%;
    right: 20px;
    border: 6px solid transparent;
    border-bottom-color: var(--primary-color);  /* blue arrow */
}
```

### Key changes:
- Text color: white instead of dark (better contrast on blue)

---

## 9. Canvas Container

**File:** `css/style.css` lines 112–124

```css
.canvas-container {
    position: relative;
    background: var(--surface-color);       /* was --bg-color → now #1a1a1a surface */
    border-radius: var(--radius-md);        /* was 0 — add rounded corners */
    border: 1px solid var(--border-color);  /* NEW */
    box-shadow: none;                       /* was --shadow-lg */
    overflow: hidden;
    margin: 0 auto;
    touch-action: none;
    user-select: none;
    width: 600px;
    height: 800px;
    max-width: 100%;
}
```

### Key changes:
- Background: surface color instead of bg-color
- Added border-radius and border
- Removed shadow

---

## 10. Border Options

**File:** `css/style.css` lines 605–644

```css
.border-option {
    aspect-ratio: 1;
    border: 1px solid var(--border-color);  /* was 5px solid */
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition);
    overflow: hidden;
    background: var(--bg-color);            /* was --bg-secondary */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-align: center;
    padding: var(--spacing-xs);
}

.border-option:hover {
    border-color: var(--primary-color);
    transform: scale(1.05);
}

.border-option.active {
    border-color: var(--primary-color);
    background: var(--primary-light);
    color: var(--primary-color);            /* was --primary-dark */
}
```

---

## 11. Modals

**File:** `css/style.css` lines 650–738

```css
.modal {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.75);        /* was 0.6 — darker */
    backdrop-filter: blur(8px);              /* NEW — frosted backdrop */
    z-index: 1000;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
}

.modal-content {
    background: var(--surface-color);        /* was --bg-color */
    border: 1px solid var(--border-color);   /* NEW */
    border-radius: var(--radius-md);         /* was --radius-lg */
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);  /* was --shadow-lg — bigger */
    max-width: 400px;
    width: 100%;
    overflow: hidden;
    animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);  /* was 3px solid */
    background: var(--bg-color);                    /* NEW — black header bg */
}

.share-url-input {
    width: 100%;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);   /* was 5px solid */
    border-radius: var(--radius-sm);
    background: var(--bg-color);             /* NEW — explicit black bg */
    font-size: 0.85rem;
    text-align: center;
    color: var(--text-secondary);
}
```

### Key changes:
- Darker modal backdrop with blur
- Modal content: surface color background with border
- Modal header: black background, 1px border
- Input borders: 1px instead of 5px

---

## 12. Mobile Home Screen

**File:** `css/style.css` lines 854–943

```css
.mobile-home {
    /* ... keep structure ... */
    background: var(--bg-color);             /* was gradient — now flat black */
}

.mobile-home-title {
    font-size: 2rem;
    font-weight: 700;                        /* was 800 */
    color: var(--text-primary);              /* was --primary-color — now white */
    margin-bottom: var(--spacing-md);
    letter-spacing: -0.02em;
}

.mobile-home-icon {
    margin: 0 auto var(--spacing-xl);
    color: var(--primary-color);             /* now blue instead of purple */
    opacity: 0.9;
    animation: pulse 2s ease-in-out infinite;
}

.btn-launch-camera {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg) var(--spacing-xl);
    background: var(--primary-color);
    border: none;                            /* was 5px solid */
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition);
    box-shadow: var(--shadow-lg);
    min-width: 200px;
}

.btn-launch-camera:hover {
    background: var(--primary-hover);
    border-color: transparent;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(41, 122, 255, 0.3);  /* blue glow */
}
```

---

## 13. Camera Controls

**File:** `css/style.css` lines 1054–1091

```css
.camera-upload-bg-btn,
.camera-add-photocard-btn {
    /* ... keep positioning ... */
    border: 1px solid rgba(255, 255, 255, 0.3);  /* was 5px solid */
    /* rest stays the same */
}
```

Only change: reduce border from `5px` to `1px`.

---

## 14. Checkbox Styling

**File:** `css/style.css` lines 576–599

```css
.checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--primary-color);      /* now blue */
    transition: var(--transition);
}
```

No structural change — the accent-color will automatically become blue via the variable.

---

## 15. Control Value Display

**File:** `css/style.css` lines 503–509

```css
.control-value {
    font-size: 0.75rem;
    color: var(--primary-color);             /* now blue instead of purple */
    font-weight: 700;
    min-width: 50px;
    text-align: right;
}
```

No structural change — color follows the variable.

---

## 16. Canvas Overlay

**File:** `css/style.css` lines 221–244

```css
.canvas-overlay {
    /* ... keep structure ... */
    background: rgba(0, 0, 0, 0.95);        /* was rgba(26,26,26,0.95) — pure black */
}
```

---

## Summary of All Border Thickness Changes

Every `5px solid` in the codebase should become `1px solid`:

| Selector | Old | New |
|---|---|---|
| `.header` border-bottom | `5px solid var(--primary-light)` | `1px solid var(--border-color)` |
| `.btn` border | `5px solid var(--border-color)` | `1px solid var(--border-color)` |
| `.btn-launch-camera` border | `5px solid var(--primary-color)` | `none` |
| `.controls-section` border | `3px solid var(--border-color)` | `1px solid var(--border-color)` |
| `.border-option` border | `5px solid var(--border-color)` | `1px solid var(--border-color)` |
| `.modal-header` border-bottom | `3px solid var(--border-color)` | `1px solid var(--border-color)` |
| `.share-url-input` border | `5px solid var(--border-color)` | `1px solid var(--border-color)` |
| `.camera-upload-bg-btn` etc. border | `5px solid rgba(...)` | `1px solid rgba(...)` |

---

## What NOT to Change

These items should remain as-is to preserve functionality:

- All JavaScript files (`canvas.js`, `ui.js`, `main.js`, `borders.js`, `toploader-config.js`)
- HTML structure (element IDs, classes, nesting)
- Camera controls positioning logic
- Canvas dimensions and aspect ratio logic
- All event handlers and interactions
- Toploader rendering configuration
- File input elements
- Z-index stacking order
- Media query breakpoints (767px / 768px)
- Touch/gesture support rules
- Animation keyframes (keep existing, just colors change via variables)
- Credit card icon rotation hack
