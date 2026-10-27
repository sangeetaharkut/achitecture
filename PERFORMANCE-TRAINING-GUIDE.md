# Performance Optimization Training Program - PDP Page
## From LCP 3.5s → Sub-2s Goal

**Objective:** Optimize Product Detail Page (PDP) performance by reducing Largest Contentful Paint (LCP), implementing code splitting, and optimizing third-party dependencies.

---

## 📋 Module Overview

| Module | Topics | Expected Metrics |
|--------|--------|------------------|
| **M1: Baseline & Analysis** | Performance auditing, LCP measurement, bundle analysis | Establish baseline |
| **M2: Image Optimization** | Next.js Image component, priority loading, responsive images | -0.5-1s |
| **M3: Code Splitting** | Route-based code splitting, component-level splitting | -0.3-0.5s |
| **M4: Dynamic Imports** | Lazy loading, React.lazy, loading states | -0.3-0.7s |
| **M5: Third-Party Cleanup** | Script optimization, dependency audit | -0.2-0.4s |
| **M6: Bundle Optimization** | Tree-shaking, minification, compression | -0.2-0.3s |
| **M7: Verification & Reporting** | Final audit, metrics template, documentation | Validate improvements |

**Total Expected Gain:** ~2.3s reduction → **Target: <2s LCP**

---

## 🚀 STEP-BY-STEP EXECUTION GUIDE FOR TRAINERS

### **SETUP: Pre-Training Preparation**

#### Step 0: Initialize Performance Baseline
```bash
# 1. Clear build artifacts
rm -rf .next

# 2. Run performance audit (before optimization)
npm run build

# 3. Analyze bundle size
npm run build:analyze

# 4. Document baseline (see PERFORMANCE-BASELINE.md)
```

#### Baseline Metrics to Record:
- **LCP (Largest Contentful Paint):** Expected ~3.5s
- **FCP (First Contentful Paint):** 
- **CLS (Cumulative Layout Shift):**
- **TTFB (Time to First Byte):**
- **Bundle Size:** Check `.next/static/chunks/`

---

## 📚 MODULE 1: Baseline Analysis & Measurement

### Objective
Establish current performance metrics and identify bottlenecks.

### Trainer Workflow

#### Step 1.1: Run Performance Audit
```bash
# Install/check Lighthouse
npm install -g lighthouse

# Run audit on local server
npm run dev
# In another terminal:
lighthouse http://localhost:3000/en/products/1 --view

# Save report
lighthouse http://localhost:3000/en/products/1 \
  --output=html \
  --output-path=./lighthouse-baseline.html
```

**Expected Findings:**
- ❌ LCP: ~3.5s (Product Chart heavy computation)
- ❌ Large bundle: ProductChart loading all charting libraries
- ❌ Render-blocking JavaScript

#### Step 1.2: Bundle Analysis
```bash
# Analyze webpack bundle
ANALYZE=true npm run build

# Or use bundle analyzer
npm run build:analyze
```

**What to Look For:**
- ProductChart component size
- Third-party library sizes
- Unused dependencies

#### Step 1.3: Learner Task
> **Hands-on Task:** Students run Lighthouse and document baseline metrics in `PERFORMANCE-BASELINE.md`

---

## 📚 MODULE 2: Image Optimization

### Objective
Optimize product images using Next.js Image component with proper priorities and sizes.

### Current State
```tsx
// ❌ BEFORE: Basic Image component
<Image
  src={product.imageUrl}
  alt={product.name}
  fill
  className="object-cover"
  priority  // ← Good, but no sizing optimization
/>
```

### Optimization Step-by-Step

#### Step 2.1: Update Image Component with Sizing
**File:** `app/[locale]/products/[id]/I18nProductDetailClient.tsx`

Students update the image section:

```tsx
// ✅ AFTER: Optimized Image component
<Image
  src={product.imageUrl}
  alt={product.name}
  width={600}
  height={600}
  className="object-cover"
  priority={true}
  quality={80}  // Reduce by 20% (usually imperceptible)
  placeholder="blur"
  blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect fill='%23f0f0f0'/%3E%3C/svg%3E"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Impact:** -0.4-0.8s LCP

#### Step 2.2: Learner Task
> Students update image tag and run `npm run dev` to verify blur placeholder appears

---

## 📚 MODULE 3: Code Splitting - Route Level

### Objective
Split product detail page code from product listing code.

#### Step 3.1: Current Issue
Product details and charts all load in single bundle chunk.

#### Step 3.2: Implementation
This is automatic in Next.js! Verify by running:

```bash
npm run build
```

**Check output:** Look for route segments in `.next/static/chunks/`
- `app/[locale]/products/[id]/page` - should be separate chunk
- `app/[locale]/products/page` - different chunk

**Learner Verification:**
```bash
# List generated chunks
ls -lh .next/static/chunks/app* | head -20
```

**Impact:** -0.2-0.3s (chunk parallelization)

---

## 📚 MODULE 4: Dynamic Imports - HIGH IMPACT

### Objective
Dynamically load ProductChart only when user scrolls to it.

#### Step 4.1: Create Dynamic Import Wrapper

**Create file:** `app/[locale]/products/[id]/ProductChart.dynamic.ts`

```typescript
import dynamic from 'next/dynamic';

export const DynamicProductChart = dynamic(
  () => import('./ProductChart').then(mod => ({ default: mod.ProductChart })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
        <p className="text-center text-gray-500">Loading analytics...</p>
      </div>
    ),
    ssr: false, // ← CRITICAL: Disable SSR for heavy component
  }
);
```

#### Step 4.2: Update I18nProductDetailClient.tsx

**Replace the ProductChart import:**

```tsx
// ❌ BEFORE
import { ProductChart } from './ProductChart';

// ✅ AFTER
import { DynamicProductChart } from './ProductChart.dynamic';
```

**In the render section, add scroll detection:**

```tsx
const [showChart, setShowChart] = useState(false);
const chartRef = useRef(null);

useEffect(() => {
  if (typeof window === 'undefined') return;
  
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setShowChart(true);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.1 }
  );

  if (chartRef.current) {
    observer.observe(chartRef.current);
  }

  return () => observer.disconnect();
}, []);
```

**Render the chart:**

```tsx
{/* At end of component, after Add to Cart section */}
<div ref={chartRef} className="mt-12 pt-8 border-t">
  <h2 className="text-2xl font-bold mb-6">{t('analytics')}</h2>
  {showChart && (
    <DynamicProductChart 
      productName={product.name} 
      productRating={product.rating} 
    />
  )}
</div>
```

**Impact:** -1.2-1.8s LCP (huge! Chart no longer blocks initial render)

#### Step 4.3: Learner Task
> Students implement dynamic import and verify:
> - Chart doesn't load on initial page load
> - Chart loads when user scrolls
> - Run `npm run build` and check bundle size reduction

---

## 📚 MODULE 5: Component-Level Code Splitting

### Objective
Split quantity selector into separate component.

#### Step 5.1: Create Quantity Selector Component

**Create file:** `app/[locale]/products/[id]/QuantitySelector.tsx`

```tsx
'use client';

import { useState } from 'react';

interface QuantitySelectorProps {
  max: number;
  value: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
  label?: string;
}

export function QuantitySelector({
  max,
  value,
  onChange,
  disabled = false,
  label = 'Quantity',
}: QuantitySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={disabled}
          className="w-10 h-10 rounded-lg border hover:bg-gray-100 font-medium disabled:opacity-50"
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max={max}
          value={value}
          onChange={(e) => onChange(Math.max(1, Math.min(max, parseInt(e.target.value) || 1)))}
          disabled={disabled}
          className="w-20 h-10 text-center border rounded-lg disabled:opacity-50"
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled}
          className="w-10 h-10 rounded-lg border hover:bg-gray-100 font-medium disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
}
```

#### Step 5.2: Update I18nProductDetailClient.tsx

```tsx
// ✅ Add import
import { QuantitySelector } from './QuantitySelector';

// Replace the quantity section with:
<QuantitySelector 
  max={product.stock}
  value={quantity}
  onChange={setQuantity}
  disabled={adding}
  label={t('quantity')}
/>
```

**Impact:** -0.1-0.2s (cleaner code splitting)

---

## 📚 MODULE 6: Third-Party Script Optimization

### Objective
Audit and remove unnecessary dependencies.

#### Step 6.1: Dependency Audit
```bash
npm list --depth=0

# Check for unused packages
npm audit

# Use npm package size checker
npm info package_name
```

#### Step 6.2: Identify Heavy Dependencies

**Task for Learners:**
Check what ProductChart imports:

```bash
# Find what's in ProductChart
grep -r "import.*from" app/[locale]/products/[id]/ProductChart.tsx
```

**Expected:** Libraries like Chart.js, Recharts, etc. loaded even if not used initially

#### Step 6.3: Optimize: Move Analytics Script to Web Worker (Optional Advanced)

**For trainers demonstrating advanced technique:**

Create `public/worker.js`:

```javascript
// Heavy computation in Web Worker
self.onmessage = function(e) {
  const { productName } = e.data;
  const results = [];
  
  // Same heavy computation, but off main thread
  for (let i = 0; i < 25000000; i++) {
    results.push({
      timestamp: Date.now(),
      metric: Math.random() * Math.sqrt(i),
      productName,
    });
  }
  
  self.postMessage({ results });
};
```

**Note:** This is optional for advanced learners.

**Impact:** -0.2-0.5s (shifts work off main thread)

---

## 📚 MODULE 7: Bundle Optimization & Minification

### Objective
Ensure proper minification and tree-shaking.

#### Step 7.1: Verify Next.js Production Build

```bash
npm run build

# Check build output
du -sh .next/static/

# Compare with development
npm run dev
```

#### Step 7.2: Check For Tree-Shaking Issues

```bash
# Analyze unused imports in bundle
npm run build:analyze
```

**Look for:**
- ✅ Unused dependencies removed
- ✅ CSS classes minified (Tailwind)
- ✅ React DevTools excluded from production

#### Step 7.3: gzip Compression (Server Level)

Verify in `next.config.ts` that compression is enabled:

```typescript
// Already default in Next.js, but verify
const nextConfig: NextConfig = {
  compress: true, // ← Enabled by default
  // ... other config
};
```

**Impact:** -0.15-0.25s

---

## 📚 MODULE 8: Core Web Vitals Targets

### Objective
Meet Google's Core Web Vitals targets.

#### Target Metrics:

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **LCP** (Largest Contentful Paint) | ~3.5s | <2s | ✅ Will achieve |
| **FID/INP** (Interaction/Input Delay) | ~150ms | <100ms | ✅ Usually auto-fix |
| **CLS** (Cumulative Layout Shift) | ~0.1+ | <0.1 | ✅ Fixed by sizing |

#### Step 8.1: Run Final Audit

```bash
# Development server
npm run dev

# In another terminal
lighthouse http://localhost:3000/en/products/1 \
  --output=html \
  --output-path=./lighthouse-final.html

# Or use WebPageTest
# https://www.webpagetest.org/
```

#### Step 8.2: Performance Budget Check

Create `performance-budget.json`:

```json
{
  "bundles": [
    {
      "name": "main",
      "maxSize": "150kb"
    },
    {
      "name": "products/[id]",
      "maxSize": "80kb"
    }
  ],
  "metrics": [
    {
      "name": "LCP",
      "maxValue": 2000
    },
    {
      "name": "CLS",
      "maxValue": 0.1
    }
  ]
}
```

**Impact:** Full optimization achieved

---

## 🧪 HANDS-ON LAB: Complete Optimization Sequence

### Lab Duration: 2-3 Hours

#### Lab Scenario
> Your e-commerce team reports PDP pages are slow (3.5s LCP). Mobile users are abandoning carts. Optimize the product detail page to meet Core Web Vitals targets.

### Lab Steps

**Step 1: Baseline (15 min)**
- [ ] Run Lighthouse audit
- [ ] Document metrics in template
- [ ] Analyze bundle with `npm run build:analyze`

**Step 2: Image Optimization (20 min)**
- [ ] Update Image component with sizing
- [ ] Add blur placeholder
- [ ] Verify improvement: `npm run dev` + Lighthouse

**Step 3: Dynamic Imports (30 min)**
- [ ] Create ProductChart.dynamic.ts
- [ ] Implement IntersectionObserver
- [ ] Verify chart loads on scroll

**Step 4: Code Splitting (15 min)**
- [ ] Verify route-based splitting with `npm run build`
- [ ] Create QuantitySelector component
- [ ] Check bundle reduction

**Step 5: Final Audit (20 min)**
- [ ] Run final Lighthouse audit
- [ ] Compare before/after metrics
- [ ] Document all changes

**Step 6: Presentation (20 min)**
- [ ] Present findings to team
- [ ] Show before/after video
- [ ] Discuss implementation details

### Lab Checklist

```
✅ Performance Optimization Lab Checklist

SETUP
[ ] Project cloned and dependencies installed
[ ] npm run dev works without errors
[ ] baseline Lighthouse report saved

MODULE 1: ANALYSIS
[ ] Lighthouse audit completed
[ ] Bundle analyzer output reviewed
[ ] Baseline metrics documented

MODULE 2: IMAGE OPTIMIZATION
[ ] Image component updated with sizing
[ ] Blur placeholder implemented
[ ] Quality reduced to 80%
[ ] No visual degradation

MODULE 3: DYNAMIC IMPORTS
[ ] ProductChart.dynamic.ts created
[ ] IntersectionObserver implemented
[ ] Chart doesn't load on initial render
[ ] Chart loads when scrolling
[ ] Loading state visible

MODULE 4: COMPONENT SPLITTING
[ ] QuantitySelector component created
[ ] Imported in main component
[ ] Bundle size reduced
[ ] Functionality unchanged

MODULE 5: FINAL VERIFICATION
[ ] npm run build completes successfully
[ ] No console errors
[ ] Final Lighthouse audit ≥80 score
[ ] LCP reduced to <2s
[ ] CLS <0.1
[ ] All accessibility checks pass

DOCUMENTATION
[ ] Before/after metrics recorded
[ ] Implementation notes completed
[ ] Changes document signed off
```

---

## 📊 Performance Metrics Template

### Baseline (BEFORE Optimization)

**Date:** _______________
**Environment:** Development / Production / Staging
**Browser:** Chrome / Firefox / Safari
**Device:** Desktop / Mobile / Tablet

| Metric | Measured | Target | Status |
|--------|----------|--------|--------|
| LCP | ___ ms | <2000 ms | ⚠️ |
| FCP | ___ ms | <1800 ms | ⚠️ |
| CLS | ___ | <0.1 | ⚠️ |
| TTFB | ___ ms | <600 ms | ⚠️ |
| Bundle Size (main) | ___ KB | <150 KB | ⚠️ |
| Bundle Size (page) | ___ KB | <80 KB | ⚠️ |

**Lighthouse Score:** ___/100

**Bottleneck Analysis:**
- Issue 1: _______________
- Issue 2: _______________
- Issue 3: _______________

---

### After Optimization (AFTER Each Module)

**Module:** _______________
**Date:** _______________

| Metric | Measured | Change | Status |
|--------|----------|--------|--------|
| LCP | ___ ms | -___ ms | ✅/⚠️ |
| FCP | ___ ms | -___ ms | ✅/⚠️ |
| CLS | ___ | -___ | ✅/⚠️ |
| TTFB | ___ ms | -___ ms | ✅/⚠️ |
| Bundle Size | ___ KB | -___ KB | ✅/⚠️ |

**Lighthouse Score:** ___/100

**Implementation Notes:**
```
What was changed:
_____________________________________________________________

Why it helped:
_____________________________________________________________

Unexpected issues:
_____________________________________________________________
```

---

## 🎯 Performance Audit Checklist

Use this during training to verify every optimization:

### ✅ Pre-Optimization Checklist
- [ ] Baseline metrics captured (use template above)
- [ ] Lighthouse audit run (desktop & mobile)
- [ ] Bundle analyzed with `npm run build:analyze`
- [ ] Network tab examined in DevTools
- [ ] Screenshots taken for before/after comparison

### ✅ Image Optimization
- [ ] Next.js `<Image>` component used
- [ ] Width/height specified (no layout shift)
- [ ] `priority={true}` for LCP image
- [ ] `quality` reduced to 80 or 75
- [ ] `placeholder="blur"` with blurDataURL
- [ ] `sizes` prop responsive
- [ ] No layout shift in Chrome DevTools

### ✅ Code Splitting
- [ ] Route-level chunks verified in build output
- [ ] No single chunk >150KB
- [ ] Page-specific chunk <80KB
- [ ] Shared dependencies properly extracted
- [ ] No duplication in chunks

### ✅ Dynamic Imports
- [ ] `next/dynamic` used for heavy components
- [ ] `ssr: false` set for client-only heavy components
- [ ] Loading state component specified
- [ ] Lazy loading triggers implemented (scroll, hover, tab click)
- [ ] Component not in initial HTML

### ✅ Third-Party Cleanup
- [ ] Unused dependencies removed
- [ ] Heavy libraries lazy-loaded
- [ ] Scripts use `async` or `defer` (if external)
- [ ] No blocking resources in Lighthouse
- [ ] Dependency audit passed (`npm audit`)

### ✅ Bundle Optimization
- [ ] Tree-shaking enabled (production build)
- [ ] CSS minified and unused removed (Tailwind)
- [ ] React DevTools excluded from production
- [ ] Source maps checked (only in dev)
- [ ] gzip compression enabled

### ✅ Core Web Vitals
- [ ] LCP <2.5s (ideal <2s)
- [ ] FCP <1.8s
- [ ] CLS <0.1
- [ ] TTFB <0.6s
- [ ] No jank on interactions

### ✅ Final Verification
- [ ] Lighthouse audit ≥80
- [ ] No console errors
- [ ] No accessibility issues
- [ ] Mobile performance ≥70
- [ ] Before/after comparison documented

---

## 🔄 Commands Reference for Trainers

```bash
# Initial setup
npm install

# Development
npm run dev                          # Start dev server
npm run build                        # Production build
npm run build:analyze                # Analyze bundle size
npm run start                        # Production server

# Performance Testing
lighthouse http://localhost:3000/en/products/1 --view
lighthouse http://localhost:3000/en/products/1 --output=html --output-path=report.html

# Verification
npm run lint
npm run test
npm run test:e2e

# Clean builds
rm -rf .next node_modules
npm install
npm run build
```

---

## 📝 Expected Output: Before/After

### BEFORE Optimization
```
❌ Metrics:
   - LCP: 3.5s
   - FCP: 2.1s
   - CLS: 0.15
   - Bundle (main): 245 KB
   - Bundle (page): 156 KB
   - Lighthouse: 42/100

🔴 Issues Found:
   - Product chart blocks rendering (heavy computation)
   - Large image without optimization
   - Render-blocking JavaScript
   - Unnecessary third-party libraries
```

### AFTER Optimization
```
✅ Metrics:
   - LCP: 1.6s ⬇️ 2.1s saved (54% improvement)
   - FCP: 1.2s ⬇️ 0.9s saved (43% improvement)
   - CLS: 0.02 ⬇️ 0.13 improved (87% improvement)
   - Bundle (main): 198 KB ⬇️ 47 KB saved (19% reduction)
   - Bundle (page): 89 KB ⬇️ 67 KB saved (43% reduction)
   - Lighthouse: 88/100 ⬆️ 46 points gained

🟢 Optimizations Applied:
   ✅ Dynamic import of ProductChart (deferred until scroll)
   ✅ Image optimization with blur placeholder
   ✅ Route-level code splitting verified
   ✅ Component-level code splitting (QuantitySelector)
   ✅ Removed unused third-party dependencies
   ✅ Tree-shaking and minification enabled
   ✅ Core Web Vitals targets met
```

---

## 📖 How to Use This Guide in Training

### For Trainers:

**Session Structure (Full Day):**
1. **Morning (Module 1-2):** Setup, baseline, image optimization
2. **Mid-morning (Module 3-4):** Code splitting, dynamic imports (LAB)
3. **Lunch Break**
4. **Afternoon (Module 5-7):** Component splitting, cleanup, bundle optimization
5. **Late Afternoon (Module 8):** Core Web Vitals, final verification, reporting

### For Learners:

1. Read through each module BEFORE session
2. Run commands exactly as shown during session
3. Document metrics in template as you progress
4. Compare before/after screenshots
5. Complete lab checklist
6. Present findings

### Questions to Ask Learners:

**Module 1:** "Why is LCP important for user experience?"
**Module 2:** "How does image optimization affect perceived performance?"
**Module 3:** "What happens when code is split at route level?"
**Module 4:** "Why use dynamic imports instead of regular imports?"
**Module 5:** "How does component splitting improve build output?"
**Module 6:** "What are the risks of adding new dependencies?"
**Module 7:** "How does tree-shaking affect bundle size?"
**Module 8:** "Which Core Web Vital is hardest to optimize? Why?"

---

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Image flickers | Blur loading | Increase blur transition time |
| Chart doesn't render | ssr: false | Check IntersectionObserver setup |
| Bundle size didn't decrease | Tree-shaking disabled | Ensure production build |
| LCP still slow | Images still not optimized | Verify width/height set |
| CLS issues | Layout shift on load | Add placeholder height to containers |

---

## 📚 Additional Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/dynamic-imports)
- [Code Splitting](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Review:** After first training session
