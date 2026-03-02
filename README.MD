# SmartPayroll

**Production-ready Namibian payroll system — offline-first PWA**

SmartPayroll is a full-featured payroll processing application built specifically for Namibian businesses. It runs entirely in the browser with no server required, supports full offline operation via a Service Worker, and can be installed on any device as a Progressive Web App. All data is stored locally using `localStorage`.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Namibian Compliance](#namibian-compliance)
- [Employee Management](#employee-management)
- [Payroll Run](#payroll-run)
- [Payslip Generation](#payslip-generation)
- [Layout Editor](#layout-editor)
- [Import & Export](#import--export)
- [Settings](#settings)
- [PWA & Offline Support](#pwa--offline-support)
- [Mobile Support](#mobile-support)
- [Data Storage](#data-storage)
- [Technology Stack](#technology-stack)
- [Browser Compatibility](#browser-compatibility)
- [Deployment](#deployment)
- [License](#license)

---

## Features

### Core Payroll
- Full **Namibian PAYE** calculation using 2026 NamRA tax brackets
- **Social Security Commission (SSC)** employee contribution (0.9%, capped at N$99.00)
- **Monthly salary** and **hourly rate** pay types per employee
- Overtime support: Normal OT (×1.5) and Sunday/Public Holiday OT (×2)
- Custom allowances, deductions, and other earnings per payroll entry
- Employer cost reporting (employer SSC contribution)

### Employee Management
- Add, edit, and delete employees
- Pay type selection: **Monthly** (fixed salary) or **Hourly** (rate × hours worked)
- Minimum wage enforcement: N$18.00/hr (N$3,510.00/month) with inline warning
- CSV import/export of employee records
- Bank and tax number storage per employee

### Payroll Runs
- Monthly payroll periods with period selector
- Live calculation for all employees in a single view
- Inline hours-worked entry for hourly employees
- Per-employee detail modal for allowances, deductions, and OT
- Batch calculate all employees with one click
- Saved payroll history with full result snapshots

### Payslip Generation
- PDF payslip download (via jsPDF) — fully customisable
- Browser print payslip
- Batch PDF generation for all employees in a run
- Payslip layout customisation (colours, headers, logo, fonts)

### Import & Export
- Full backup (JSON) — employees, payroll runs, settings, and layout config
- Employees CSV / JSON
- Payroll history CSV / JSON
- Settings & layout config JSON
- Smart import with format detection, preview, and selective restore

### PWA
- Installable on Android and iOS (Add to Home Screen)
- Full offline operation — all assets cached by Service Worker
- Install prompt banner
- Automatic update notification when a new version is available

---

## Getting Started

SmartPayroll requires no build step or server. To run it locally:

```bash
# Clone or download the repository
git clone https://github.com/your-org/smartpayroll.git
cd smartpayroll

# Serve with any static HTTP server (required for PWA features)
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

> **Note:** PWA features (install prompt, service worker, offline caching) require the app to be served over **HTTPS** in production. `localhost` is exempt for development.

### Quick Start with Demo Data

1. Open the app and navigate to **Settings**
2. Click **Load Demo Data** to populate 5 sample Namibian employees (3 monthly, 2 hourly)
3. Go to **Payroll Run**, select the current month, and click **Load Period**
4. Enter hours worked for hourly employees, then click **Calculate All**
5. Click **Save Run** to store results and enable payslip generation

---

## Project Structure

```
smartpayroll/
├── index.html          # App shell — HTML structure, PWA meta tags
├── app.css             # All styles — mobile-first, dark mode, animations
├── app.js              # All application logic — ~1,960 lines
├── sw.js               # Service Worker — offline caching strategy
├── manifest.json       # PWA Web App Manifest
└── icons/
    ├── icon-192.png    # PWA icon (192×192)
    ├── icon-512.png    # PWA icon (512×512)
    ├── apple-touch-icon.png
    └── favicon-32.png
```

### app.js Architecture

| Section | Lines | Responsibility |
|---|---|---|
| State | 1–22 | Global variables, layoutConfig defaults |
| Tax Calculations | 24–96 | PAYE brackets, SSC, OT, payroll calc |
| Persistence | 98–112 | localStorage read/write helpers |
| Navigation | 114–129 | Tab switching, page titles |
| Employees | 131–276 | CRUD, modal, CSV import, rendering |
| Payroll Run | 278–430 | Period loading, table render, entry updates |
| Payroll Detail Modal | 431–590 | Allowances, deductions, hours worked |
| Payslips | 592–640 | Run listing, batch PDF |
| PDF Generation | 641–930 | jsPDF payslip builder |
| Print | 931–1050 | Browser print payslip |
| Dashboard | 1051–1100 | Stats, charts |
| Demo Data | 1051–1080 | 5 sample employees |
| Settings | 1081–1100 | Company info form |
| Layout Editor | 1101–1400 | Config UI, preview, presets |
| Import / Export | 1580–1960 | All backup/restore functions |
| Pay Type Toggle | 1415–1460 | setPayType UI handler |
| PWA / Mobile | 1461–1560 | SW registration, sidebar, bottom nav |

---

## Namibian Compliance

### PAYE (2026 NamRA Brackets)

| Annual Income (NAD) | Rate | Cumulative Base Tax |
|---|---|---|
| 0 – 100,000 | 0% | — |
| 100,001 – 150,000 | 18% | 0 |
| 150,001 – 350,000 | 25% | 9,000 |
| 350,001 – 550,000 | 28% | 59,000 |
| 550,001 – 850,000 | 30% | 115,000 |
| 850,001 – 1,550,000 | 32% | 205,000 |
| 1,550,001+ | 37% | 429,000 |

PAYE is calculated by annualising the employee's monthly gross pay, applying the bracket, then dividing by 12 for the monthly deduction.

### Social Security Commission (SSC)

- **Rate:** 0.9% of basic salary (employee contribution)
- **Ceiling:** N$11,000 contribution base → maximum N$99.00/month
- **Floor:** N$500 contribution base → minimum N$4.50/month
- Employer SSC matches employee contribution (shown in employer costs section)

### Overtime Rates

| Type | Multiplier | Trigger |
|---|---|---|
| Normal OT | 1.5× hourly rate | Weekdays beyond standard hours |
| Sunday / Public Holiday OT | 2× hourly rate | Sundays and public holidays |

Hourly rate for monthly employees is derived as: `monthly salary ÷ 195 hours`.

### Minimum Wage

- **N$18.00/hr** (Namibian national minimum wage)
- Monthly equivalent: **N$3,510.00** (N$18 × 195 hrs)
- The app flags any employee with a salary or rate below this threshold

---

## Employee Management

### Add / Edit Employee

Fields captured per employee:

| Field | Required | Notes |
|---|---|---|
| Full Name | ✓ | |
| Employee ID | ✓ | Must be unique (used as merge key in imports) |
| Position | ✓ | |
| Pay Type | ✓ | `monthly` or `hourly` |
| Basic Salary (NAD) | Monthly only | Fixed monthly gross base |
| Hourly Rate (NAD) | Hourly only | Rate per hour; hours entered each pay run |
| Start Date | | |
| Bank Name | | |
| Account Number | | |
| Tax Number (NamRA) | | |

### Pay Types

**Monthly** employees have a fixed `basicSalary`. Their base pay is the same every month unless edited.

**Hourly** employees have an `hourlyRate`. Each payroll run requires entering the number of hours worked. Base pay is computed as `hourlyRate × hoursWorked`. There is no fixed monthly amount — if hours are not entered, base pay is N$0.

---

## Payroll Run

### Workflow

1. Select **month** and **year** from the period droppers
2. Click **Load Period** — existing saved data for that period is restored if available
3. For **hourly employees**: enter hours worked in the amber-highlighted input column
4. Optionally click **Edit** on any row to open the detail modal for allowances, deductions, and OT hours
5. Click **Calculate All** to recompute all rows
6. Review totals in the summary footer row
7. Click **Save Run** to persist the payroll run and unlock payslip generation

### Payroll Table Columns

| Column | Description |
|---|---|
| Employee | Name, ID, pay type badge |
| Hours / Basic | Hours input (hourly) or `—` (monthly) |
| Base Pay (N$) | Computed base: salary or `hrs × rate` |
| OT Normal hrs | Input: overtime weekday hours |
| OT Sun/PH hrs | Input: Sunday / public holiday hours |
| OT Pay (N$) | Computed OT earnings |
| Allowances | Sum of custom allowances |
| Other Earn. | Additional miscellaneous earnings |
| Gross (N$) | Total before deductions |
| SSC Emp (N$) | Employee SSC contribution |
| PAYE (N$) | Monthly PAYE deduction |
| Other Ded. | Sum of custom deductions |
| Net Pay (N$) | Take-home amount |
| Details | Opens per-employee detail modal |

### Detail Modal

Per-employee modal allows entering:
- Hours worked (hourly employees only) — with live base pay preview
- OT Normal hours (×1.5)
- OT Sunday/PH hours (×2)
- Named allowances (description + amount, multiple entries)
- Named deductions (category + amount, multiple entries)
- Other earnings (miscellaneous lump sum)

---

## Payslip Generation

Payslips can be generated from any saved payroll run.

### PDF Payslip

Generated using **jsPDF** — no server or external service required. The PDF respects all layout configuration settings:

- Company logo (text badge or uploaded image)
- Header style (Classic Split / Centred Banner / Minimal Line / Bold Dark Bar)
- Custom colours for header, accent, net pay box, earnings, and deductions
- Namibian flag bar (optional)
- One-column or two-column earnings/deductions layout
- Net pay display style (Large Box / Full Banner / Simple Row)
- Employer costs section (optional)
- Signature lines (optional)
- Account number masking (optional)
- YTD row (optional)
- Custom footer text
- Diagonal watermark text (optional)
- Font family (Arial / Times / Georgia / Courier)

### Browser Print

A formatted print view matching the PDF layout is available from the payslip list.

### Batch PDF

Generate PDFs for all employees in a selected run in a single operation.

---

## Layout Editor

The **Layout Editor** tab provides a live preview panel (A4 @ 70% zoom) alongside a full configuration panel.

### Presets

| Preset | Description |
|---|---|
| Namibian Classic | Blue/green flag theme, classic header |
| Corporate Gold | Navy/gold, bold header, Georgia font |
| Clean Minimal | Greyscale, minimal line header |
| Bold Purple | Purple/pink, centred banner |

### Configuration Options

- **Colours:** Primary/header, accent/lines, net pay box, earnings background, deductions background
- **Header Styles:** Classic Split, Centred Banner, Minimal Line, Bold Dark Bar
- **Logo:** None / Text badge (1–3 chars) / Uploaded image (base64)
- **Content Toggles:** Namibian flag bar, two-column layout, employer costs, signature lines, account number masking, YTD row
- **Net Pay Style:** Large Coloured Box / Full-width Banner / Simple Row
- **Font:** Arial, Times New Roman, Georgia, Courier
- **Footer:** Custom text string
- **Watermark:** Diagonal overlay text (e.g. `CONFIDENTIAL`)

All layout settings are applied to both PDF and browser print output.

---

## Import & Export

### Export Formats

| Export | Format | Contents |
|---|---|---|
| Full Backup | `.json` | Employees + payroll runs + settings + layout config |
| Employees | `.csv` | Name, ID, position, pay type, salary/rate, bank, tax |
| Employees | `.json` | Full employee records (re-importable) |
| Payroll History | `.csv` | All runs with PAYE, SSC, net pay per employee per period |
| Payroll History | `.json` | Complete run data (re-importable) |
| Settings & Layout | `.json` | Company info + payslip layout configuration |

Export filenames include the date: e.g. `smartpayroll_backup_20260302.json`.

### Import

Supported file types: `.json` and `.csv`.

| File | What is imported |
|---|---|
| Full backup `.json` | Any combination of: employees, payroll runs, settings, layout config (selective checkboxes) |
| Employees `.json` | Employee records |
| Payroll runs `.json` | Historical payroll run data |
| Settings `.json` | Company settings + layout config |
| Employees `.csv` | Employee list — detects old (8-column) and new (10-column with pay type) formats automatically |

**Merge behaviour:** Employees are matched by `empId`. Existing records are updated; new ones are added. Payroll runs are matched by month + year.

---

## Settings

Located in the **Settings** tab.

| Setting | Field |
|---|---|
| Company Name | Displayed on payslips |
| Company Registration No. | Displayed on payslips |
| Company Address | Displayed on payslips |
| Company Tax Number | Displayed on payslips |

The Settings tab also provides:
- The **Import & Export** panel (all backup/restore operations)
- The **Namibian Tax Reference** card (2026 brackets, SSC rates, minimum wage)
- The **Danger Zone** (clear all data from localStorage)

---

## PWA & Offline Support

SmartPayroll is a fully compliant Progressive Web App.

### Service Worker (`sw.js`)

- **Cache strategy:** Cache-first for all local assets; network-then-cache for external CDN resources
- **Cache name:** `smartpayroll-v1.2.0` (updated each release)
- **Offline fallback:** Returns `index.html` for any navigation request when offline
- **Auto-update:** Detects when a new service worker is installed and notifies the user via toast

### Install Prompt

- On supported browsers, an install banner appears offering to add the app to the home screen
- The banner can be dismissed permanently (stored in `localStorage`)
- Once dismissed, the `beforeinstallprompt` event is retained and can be triggered programmatically

### Web App Manifest (`manifest.json`)

```json
{
  "name": "SmartPayroll – Namibian Payroll",
  "short_name": "SmartPayroll",
  "display": "standalone",
  "theme_color": "#003DA6",
  "background_color": "#003DA6",
  "shortcuts": [
    { "name": "Run Payroll", "url": "./index.html#payroll" },
    { "name": "Employees",   "url": "./index.html#employees" }
  ]
}
```

---

## Mobile Support

SmartPayroll is fully optimised for phones and tablets.

### Mobile Navigation

- **Bottom navigation bar** (5 tabs: Home, Staff, Payroll, Slips, More) — visible only on screens ≤ 767px
- **Hamburger sidebar** — slides in from the left with a backdrop overlay; closes on nav link tap or overlay tap
- Sidebar and bottom nav are always in sync

### Touch Optimisations

- All interactive elements have a minimum touch target of **44px**
- Input `font-size: 16px` prevents iOS auto-zoom on focus
- Modals bottom-anchor on mobile (sheet style), centre on desktop
- `overscroll-behavior: contain` prevents scroll chaining
- `-webkit-overflow-scrolling: touch` on all scroll containers
- `100dvh` (dynamic viewport height) prevents layout shift from browser chrome

### Safe Area Support

- `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` applied to header and bottom nav
- Notch and home bar on modern iPhones are handled correctly

---

## Data Storage

All data is stored in **`localStorage`** under the following keys:

| Key | Contents |
|---|---|
| `smartpayroll_employees` | JSON array of employee records |
| `smartpayroll_runs` | JSON array of saved payroll runs |
| `smartpayroll_settings` | JSON object with company info |
| `smartpayroll_layout` | JSON object with payslip layout config |
| `smartpayroll_install_dismissed` | Flag to suppress the install banner |

> **Storage limit:** `localStorage` is typically limited to **5–10 MB** per origin. For large organisations with many payroll runs, periodic backups via the Export function are recommended.

No data is ever transmitted to any server. SmartPayroll operates entirely client-side.

---

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| HTML5 / CSS3 / JS (ES2020) | — | Core application |
| [Tailwind CSS](https://tailwindcss.com) | CDN | Utility-first styling |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | PDF payslip generation |
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) | — | Primary UI font |
| [DM Mono](https://fonts.google.com/specimen/DM+Mono) | — | Numeric / monospace font |
| Service Worker API | — | Offline caching |
| Web App Manifest | — | PWA install |
| localStorage API | — | Persistent data storage |
| FileReader API | — | CSV / JSON import |
| Blob / URL.createObjectURL | — | File download |

No frontend framework, no bundler, no build step required.

---

## Browser Compatibility

| Browser | Support |
|---|---|
| Chrome / Edge 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ (iOS & macOS) | ✅ Full |
| Samsung Internet 14+ | ✅ Full |
| Opera 76+ | ✅ Full |

PWA install is supported on Chrome (Android), Edge, and Samsung Internet. Safari (iOS) supports "Add to Home Screen" via the share sheet.

---

## Deployment

SmartPayroll is a static site — any web server or CDN can host it.

### Requirements

- HTTPS (required for Service Worker and PWA install)
- No server-side processing needed
- No database, no API, no environment variables

### Recommended Hosts

| Host | Notes |
|---|---|
| [Netlify](https://netlify.com) | Drop the `smartpayroll/` folder onto the Netlify dashboard |
| [Vercel](https://vercel.com) | `vercel --prod` from the project directory |
| [GitHub Pages](https://pages.github.com) | Push to a `gh-pages` branch |
| [Cloudflare Pages](https://pages.cloudflare.com) | Connect your repository |
| Nginx / Apache | Serve the folder as a static site root |

### Nginx Example

```nginx
server {
    listen 443 ssl;
    server_name payroll.yourcompany.na;

    root /var/www/smartpayroll;
    index index.html;

    # Required for PWA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|ico|json)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service worker must not be cached
    location = /sw.js {
        add_header Cache-Control "no-cache";
    }
}
```

### Updating the App

When deploying a new version:

1. Update the `CACHE_NAME` constant in `sw.js` (e.g. `smartpayroll-v1.3.0`)
2. Deploy the updated files
3. Users will see a toast notification: *"Update available – refresh to apply"*

---

## License

MIT License — see `LICENSE` for details.

---

*SmartPayroll is intended to assist payroll processing in compliance with Namibian tax law as of 2026. It is not a substitute for professional accounting or legal advice. Always verify calculations against current NamRA and SSC guidelines.*
