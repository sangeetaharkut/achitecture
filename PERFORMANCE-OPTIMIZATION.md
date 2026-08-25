# Bundle Optimization & Core Web Vitals Guide

## 📊 Step-by-Step Testing & Optimization Guide

This guide will walk you through measuring, optimizing, and verifying performance improvements for your Next.js application.

---

## Table of Contents
1. [Initial Baseline Measurement](#step-1-baseline-measurement)
2. [Understanding Core Web Vitals](#core-web-vitals-explained)
3. [Bundle Analysis](#step-2-analyze-bundle)
4. [Optimization Implementations](#step-3-optimizations)
5. [Final Measurements](#step-4-final-verification)
6. [Quick Reference](#quick-reference)

---

## Step 1: Baseline Measurement

### 1.1 Measure Current Bundle Size

** Important: Next.js 16 uses Turbopack by default**

Next.js 16 uses Turbopack which has a new analyzer. Use one of these methods:

**Method 1: Turbopack Analyzer (Recommended for Next.js 16+)**
```bash
# Uses the new experimental Turbopack analyzer
npm run build:analyze
```

**Method 2: Webpack Analyzer (Fallback)**
```bash
# Falls back to webpack with traditional bundle analyzer
npm run build:analyze:webpack
```

**What happens:**
- Next.js builds your app for production
- Opens browser tab with interactive bundle visualization
- Shows detailed breakdown of dependencies and chunks
- Displays size in KB for each module

**Record these numbers from the console output:**

```
Route (app)                                Size     First Load JS
┌ ○ /                                      XX KB    XXX KB
├ ○ /[locale]                              XX KB    XXX KB
├ ○ /[locale]/cart                         XX KB    XXX KB
├ ○ /[locale]/products                     XX KB    XXX KB
└ ○ /[locale]/products/[id]                XX KB    XXX KB

○ (Static)  automatically rendered as static HTML
ƒ (Dynamic)  server-side renders at runtime
First Load JS shared by all                XXX KB    ← RECORD THIS
  ├ chunks/[hash].js                       XX KB
  └ chunks/[hash].js                       XX KB
```

**Create a baseline document:**

```bash
# Windows PowerShell
New-Item -Path "BASELINE.txt" -ItemType File -Force
```

**In BASELINE.txt, record:**
```
=== BASELINE MEASUREMENT - DATE: 2026-08-25 ===

BUNDLE SIZES (from npm run build output):
- Total First Load JS: XXX KB
- Largest route: XXX KB
- Smallest route: XX KB

CLIENT BUNDLE (from browser analyzer):
- Total: XXX KB
- node_modules: XXX KB
- app pages: XX KB
- Largest dependency: [name] XX KB

SERVER BUNDLE:
- Total: XXX KB
```

### 1.2 Measure Core Web Vitals (Lighthouse)

```bash
# Start production build
npm run build
npm run start
```

**In Chrome:**
1. Open **http://localhost:3000**
2. Press **F12** → **Lighthouse** tab
3. Select:
   - ✅ Performance
   - ✅ Desktop (or Mobile)
4. Click **Analyze page load**

**Record these metrics in BASELINE.txt:**

```
LIGHTHOUSE SCORES (Desktop):
- Performance: XX/100
- LCP (Largest Contentful Paint): X.Xs
- CLS (Cumulative Layout Shift): 0.XXX
- INP (Interaction to Next Paint): XXXms
- TBT (Total Blocking Time): XXXms
- Speed Index: X.Xs

LIGHTHOUSE SCORES (Mobile):
- Performance: XX/100
- LCP: X.Xs
- CLS: 0.XXX
- INP: XXXms
```

### 1.3 Test With WebPageTest (Optional but Recommended)

**For detailed real-world metrics:**

1. Go to https://www.webpagetest.org/
2. Deploy to production (Vercel/Netlify) or use ngrok for localhost
3. Test URL with:
   - Location: Closest to your users
   - Browser: Chrome
   - Connection: 4G or Cable
4. Record: LCP, CLS, TBT, Speed Index

---

## Core Web Vitals Explained

###  The Three Key Metrics

#### 1. LCP (Largest Contentful Paint)
**What it measures:** How long it takes for the largest visible element to load

**Target:**  < 2.5s (Good) |  2.5s-4s (Needs Improvement) |  > 4s (Poor)

**What counts as LCP:**
- `<img>` elements
- `<image>` inside `<svg>`
- Video thumbnail
- Background images loaded with CSS `url()`
- Block-level text elements

**How to improve:**
- Optimize images (WebP, proper sizing, lazy loading)
- Reduce JavaScript blocking time
- Use CDN for static assets
- Implement Server-Side Rendering (SSR)
- Preload critical resources
- Remove unused CSS/JavaScript

**Example in this project:**
```typescript
// Before (slow)
<img src="/hero.jpg" />

// After (optimized)
<Image 
  src="/hero.jpg" 
  priority 
  width={1200} 
  height={600}
/>
```

#### 2. INP (Interaction to Next Paint) - Replaces FID
**What it measures:** How quickly the page responds to user interactions

**Target:**  < 200ms (Good) |  200ms-500ms (Needs Improvement) |  > 500ms (Poor)

**What counts:**
- Click, tap, or key press
- Time from interaction to visual feedback

**How to improve:**
- Reduce JavaScript execution time
- Break up long tasks (use code splitting)
- Avoid large re-renders
- Use `useTransition` for non-urgent updates
- Implement virtualization for long lists

**Example:**
```typescript
// Before (blocking)
const handleClick = () => {
  // Heavy computation blocks UI
  const result = processHeavyData(largeArray);
  setData(result);
};

// After (non-blocking)
import { useTransition } from 'react';

const [isPending, startTransition] = useTransition();

const handleClick = () => {
  startTransition(() => {
    const result = processHeavyData(largeArray);
    setData(result);
  });
};
```

#### 3. CLS (Cumulative Layout Shift)
**What it measures:** Visual stability - how much elements move unexpectedly

**Target:**  < 0.1 (Good) |  0.1-0.25 (Needs Improvement) |  > 0.25 (Poor)

**What causes CLS:**
- Images without dimensions
- Ads, embeds, iframes without reserved space
- Dynamically injected content
- Web fonts causing FOIT/FOUT
- Actions waiting for network response

**How to improve:**
- Always include width/height on images
- Reserve space for ads/embeds
- Use `font-display: swap` with fallback fonts
- Avoid inserting content above existing content
- Use CSS `aspect-ratio` for responsive elements

**Example:**
```typescript
// Before (causes CLS)
<img src="/logo.png" />

// After (prevents CLS)
<Image 
  src="/logo.png" 
  width={200} 
  height={50} 
  alt="Logo"
/>
```

### 📈 Secondary Metrics

**TBT (Total Blocking Time):**
- Measures total time page is blocked from responding
- Target: < 300ms

**FCP (First Contentful Paint):**
- When first content appears
- Target: < 1.8s

**TTI (Time to Interactive):**
- When page becomes fully interactive
- Target: < 3.8s

**Speed Index:**
- How quickly content is visually displayed
- Target: < 3.4s

---

## Step 2: Analyze Bundle

### 2.1 Run Bundle Analyzer

**For Next.js 16 (Turbopack):**
```bash
npm run build:analyze
```

**For older Next.js or to use webpack:**
```bash
npm run build:analyze:webpack
```

**One browser tab will open with bundle visualization.**

#### Client Bundle Analysis
**Look for:**
-  **Large dependencies** (> 50KB)
  - `next-intl`: Check if tree-shaking works
  - `@prisma/client`: Should only be in server bundle
  - Any unused libraries

-  **Duplicate code** (same module in multiple chunks)

-  **Heavy UI components** that could be lazy-loaded:
  - Charts/graphs libraries
  - Rich text editors
  - Date pickers
  - Modal dialogs

#### Server Bundle Analysis  
**Look for:**
- Database libraries (Prisma) - OK here
- Node.js modules - OK here
- React components - Should be minimal

### 2.2 Identify Optimization Targets

**Create a file: `OPTIMIZATION_TARGETS.md`**

```markdown
# Bundle Optimization Targets

## Heavy Dependencies (> 50KB)
1. [Library Name] - XX KB
   - Current: Used everywhere
   - Plan: Dynamic import
   - Expected saving: XX KB

## Code Splitting Opportunities
1. Admin Section
   - Size: XX KB
   - Usage: < 10% of users
   - Plan: Route-based split

2. Product Detail Page
   - Heavy components: Image viewer, reviews
   - Plan: Lazy load below fold

## Third-Party Scripts
1. Google Analytics
   - Current: Loaded in layout
   - Plan: next/script with afterInteractive

## Font Optimization
1. Current: Google Fonts
   - FOIT/FOUT issues
   - Plan: font-display: swap + preload
```

---

## Step 3: Optimizations

### 3.1 Dynamic Imports for Heavy Components

**Create: `src/components/DynamicComponents.tsx`**

```typescript
import dynamic from 'next/dynamic';

// Heavy chart library - only load when needed
export const DynamicChart = dynamic(
  () => import('./Chart').then(mod => mod.Chart),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-64 rounded-lg">
        Loading chart...
      </div>
    ),
    ssr: false, // Don't render on server if not needed
  }
);

// Rich text editor - heavy dependency
export const DynamicEditor = dynamic(
  () => import('./RichTextEditor').then(mod => mod.RichTextEditor),
  {
    loading: () => <div>Loading editor...</div>,
    ssr: false,
  }
);

// Modal - not needed until user clicks
export const DynamicModal = dynamic(
  () => import('./Modal').then(mod => mod.Modal),
  {
    loading: () => null,
  }
);
```

**Usage:**
```typescript
// Before
import { Chart } from '@/components/Chart';

function Dashboard() {
  return <Chart data={data} />;
}

// After
import { DynamicChart } from '@/components/DynamicComponents';

function Dashboard() {
  return <DynamicChart data={data} />;
}
```

### 3.2 Third-Party Script Optimization

**Update: `app/[locale]/layout.tsx`**

```typescript
import Script from 'next/script';

export default async function LocaleLayout({ children, params }) {
  // ... existing code ...

  return (
    <html lang={locale}>
      <head>
        {/* Hreflang tags */}
        <link rel="alternate" hrefLang="en" href="/en" />
        <link rel="alternate" hrefLang="hi" href="/hi" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body>
        {children}

        {/* Google Analytics - load after page is interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </body>
    </html>
  );
}
```

**Script strategies:**
- `beforeInteractive` - Loads before page hydration (critical scripts)
- `afterInteractive` - Loads after page is interactive (analytics, ads)
- `lazyOnload` - Loads during idle time (non-critical widgets)
- `worker` - Loads in web worker (experimental)

### 3.3 Route-Level Code Splitting (Admin Example)

**Create: `app/[locale]/admin/layout.tsx`**

```typescript
import dynamic from 'next/dynamic';

// Admin components only load when /admin routes are accessed
const AdminSidebar = dynamic(() => import('@/components/admin/Sidebar'));
const AdminHeader = dynamic(() => import('@/components/admin/Header'));

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div>
        <AdminHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

### 3.4 Image Optimization

```typescript
// Before (not optimized)
<img src="/hero.jpg" alt="Hero" />

// After (optimized)
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/..." // Or use automatic blur
/>

// Below-the-fold images (lazy load)
<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={400}
  loading="lazy"
/>
```

### 3.5 Font Optimization

**Update: `app/[locale]/layout.tsx`**

```typescript
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Prevents invisible text during load
  preload: true,
  fallback: ['system-ui', 'arial'], // System font fallback
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['courier', 'monospace'],
});
```

**In CSS:**
```css
/* Add font-display to global styles */
@font-face {
  font-family: 'Custom Font';
  font-display: swap; /* Shows fallback font immediately */
  src: url('/fonts/custom.woff2') format('woff2');
}
```

### 3.6 React.lazy and Suspense

**For client components:**

```typescript
import { lazy, Suspense } from 'react';

// Lazy load component
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function Page() {
  return (
    <div>
      <h1>Page Content</h1>
      
      {/* Wrap in Suspense with fallback */}
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

**With error boundary:**

```typescript
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const HeavyChart = lazy(() => import('./Chart'));

function Dashboard() {
  return (
    <ErrorBoundary fallback={<div>Chart failed to load</div>}>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={data} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## Step 4: Final Verification

### 4.1 Re-measure Bundle Size

```bash
npm run build:analyze
```

**Compare with baseline:**

```
=== OPTIMIZED MEASUREMENT - DATE: 2026-08-25 ===

BUNDLE SIZES:
- Total First Load JS: XXX KB (was: XXX KB) ↓ XX KB (-XX%)
- Largest route: XXX KB (was: XXX KB) ↓ XX KB
- Smallest route: XX KB (was: XX KB)

CLIENT BUNDLE:
- Total: XXX KB (was: XXX KB) ↓ XX KB (-XX%)
- node_modules: XXX KB (was: XXX KB)

IMPROVEMENTS:
✅ Reduced first load by XX KB
✅ Split admin code into separate chunk
✅ Lazy loaded heavy components
```

### 4.2 Re-run Lighthouse

```bash
npm run build
npm run start
```

**Test with Lighthouse and compare:**

```
LIGHTHOUSE SCORES (Desktop):
Before → After
- Performance: XX/100 → XX/100 (+X)
- LCP: X.Xs → X.Xs (↓ X.Xs)
- CLS: 0.XXX → 0.XXX (↓ 0.XXX)
- INP: XXXms → XXXms (↓ XXms)

IMPROVEMENTS:
✅ LCP improved by X.Xs
✅ CLS improved by 0.XXX
✅ Performance score +X points
```

### 4.3 Verify in Production

**Deploy to production (Vercel/Netlify) and test:**

```bash
# If using Vercel
vercel --prod

# Test production URL with Lighthouse
# Use Chrome DevTools → Lighthouse → Production URL
```

**Use real-world testing:**
- Mobile device on 4G
- Different geographical locations
- WebPageTest with multiple runs

---

## Quick Reference

### Testing Commands

```bash
# Analyze bundle (Turbopack - Next.js 16+)
npm run build:analyze

# Analyze bundle (Webpack - traditional)
npm run build:analyze:webpack

# Production build
npm run build

# Start production server
npm run start

# Development (no optimization)
npm run dev
```

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP    | < 2.5s | 2.5s - 4s | > 4s |
| INP    | < 200ms | 200ms - 500ms | > 500ms |
| CLS    | < 0.1 | 0.1 - 0.25 | > 0.25 |

### Optimization Checklist

- [ ] Bundle analyzer configured
- [ ] Baseline measurements recorded
- [ ] Heavy components identified
- [ ] Dynamic imports implemented
- [ ] Third-party scripts optimized (next/script)
- [ ] Images optimized (next/image)
- [ ] Fonts optimized (font-display: swap)
- [ ] Route-level code splitting
- [ ] Suspense boundaries added
- [ ] Preconnect hints added
- [ ] Final measurements taken
- [ ] Production deployment verified

### Tools

**Built-in:**
- Chrome DevTools Lighthouse
- Chrome DevTools Performance tab
- Next.js Build Analyzer

**External:**
- [WebPageTest](https://www.webpagetest.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [web.dev/measure](https://web.dev/measure/)

### Next Steps

1. **Monitor in production** - Set up Real User Monitoring (RUM)
2. **Set performance budgets** - Fail CI if bundle > X KB
3. **Regular audits** - Monthly Lighthouse reports
4. **A/B test optimizations** - Measure real impact

---

**Last Updated:** 2026-08-25  
**Project:** Next.js Architecture Demo  
**Status:** Ready for optimization testing
