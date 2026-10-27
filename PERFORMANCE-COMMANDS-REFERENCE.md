# Performance Optimization Lab - Commands Reference


# Verify project dependencies
npm ls next react react-dom 2>/dev/null | head -10
```

**Expected Output:**
```
v18.17.0 (or higher)
9.x.x
next@16.3.2
react@19.2.8
react-dom@19.2.8
```

---

### Step 2: Clean Install & Build
```bash
# Remove old artifacts
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies (if not already done)
npm install

# Verify installation
npm list next --depth=0
```

**Expected:** No errors, dependencies installed ✅

---

## 📊 Phase 1: Baseline Analysis (25 Minutes)

### Step 3: Run Development Server
```bash
# Start the dev server
npm run dev

# Expected output:
# ▲ Next.js 16.3.2
# - Local:        http://localhost:3000
# - Environments: .env
```

**Keep this terminal open!** Open a NEW terminal for next commands.

---

### Step 4: Run Lighthouse Baseline Audit
```bash
# In NEW terminal (keep dev server running)
# Wait 3-5 seconds for server to be ready

# Run Lighthouse on PDP
lighthouse http://localhost:3000/en/products/1 --view

# This opens browser with full report
```

**In Lighthouse Report - Record These Metrics:**

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP (Largest Contentful Paint) | ___ ms | <2500 ms | ____ |
| FCP (First Contentful Paint) | ___ ms | <1800 ms | ____ |
| CLS (Cumulative Layout Shift) | ___ | <0.1 | ____ |
| Speed Index | ___ ms | <4000 ms | ____ |
| Performance Score | ___/100 | ≥80 | ____ |

**Save Report:**
```bash
# Export HTML report
lighthouse http://localhost:3000/en/products/1 \
  --output=html \
  --output-path=./baseline-lighthouse.html

# Verify saved
ls -lh baseline-lighthouse.html
```

---

### Step 5: Bundle Analysis
```bash
# In a third terminal (keep dev server running)
# Analyze bundle size

ANALYZE=true npm run build

# This opens browser with bundle analyzer
# Look for:
# - ProductChart size (~67KB)
# - Total page bundle size
# - Libraries included (Chart.js, Plotly, D3, etc.)
```

**Record Bundle Metrics:**

| Package | Size | Notes |
|---------|------|-------|
| main bundle | ___ KB | Shared React, Next.js |
| page bundle | ___ KB | PDP-specific code |
| ProductChart | ___ KB | Charts & analytics |
| Total (gzipped) | ___ KB | What user downloads |

---

### Step 6: Network Tab Analysis
```bash
# DevTools Network Analysis
# Steps:
# 1. Keep dev server running (npm run dev)
# 2. Open http://localhost:3000/en/products/1
# 3. Open Chrome DevTools (F12)
# 4. Go to Network tab
# 5. Refresh page (Ctrl+R)
# 6. Record values below:
```

**Network Metrics to Record:**

| Resource | Size | Time |
|----------|------|------|
| HTML document | ___ KB | ___ ms |
| Main JS | ___ KB | ___ ms |
| Page JS | ___ KB | ___ ms |
| Product Image | ___ KB | ___ ms |
| CSS | ___ KB | ___ ms |
| Fonts | ___ KB | ___ ms |
| TOTAL | ___ KB | ___ ms |

---

## ✅ Phase 2: Verify Optimizations Are in Place (10 Minutes)

### Step 7: Check New Files Exist
```bash
# Verify dynamic import wrapper
ls -la app/\[locale\]/products/\[id\]/ProductChart.dynamic.ts
# Expected: File exists, ~35 lines

# Verify QuantitySelector component
ls -la app/\[locale\]/products/\[id\]/QuantitySelector.tsx
# Expected: File exists, ~60 lines

# Verify main component is updated
ls -la app/\[locale\]/products/\[id\]/I18nProductDetailClient.tsx
# Expected: File exists, updated with dynamic imports
```

**Expected Output:**
```
✓ ProductChart.dynamic.ts (35 lines)
✓ QuantitySelector.tsx (60 lines)
✓ I18nProductDetailClient.tsx (updated)
```

---

### Step 8: Verify Imports Are Correct
```bash
# Check if dynamic import is being used
grep -n "DynamicProductChart" app/\[locale\]/products/\[id\]/I18nProductDetailClient.tsx

# Expected:
# 1: import { DynamicProductChart } from './ProductChart.dynamic';
# 2: return <DynamicProductChart ...
```

---

### Step 9: Verify Image Optimization
```bash
# Check if Image has optimizations
grep -A 5 "width={600}" app/\[locale\]/products/\[id\]/I18nProductDetailClient.tsx

# Expected to see:
# width={600}
# height={600}
# quality={80}
# placeholder="blur"
# sizes="..."
```

---

### Step 10: Verify Scroll Detection
```bash
# Check if IntersectionObserver is implemented
grep -n "IntersectionObserver" app/\[locale\]/products/\[id\]/I18nProductDetailClient.tsx

# Expected:
# 1: new IntersectionObserver(
# 2: threshold: 0.1
```

---

## 🔨 Phase 3: Build & Verify Optimizations (20 Minutes)

### Step 11: Production Build
```bash
# Stop dev server (Ctrl+C in that terminal)

# Create production build
npm run build

# Expected output:
# ✓ Route (pages)                                Size     First Load JS
# ✓ /en/products/[id]                            XX KB    123 KB
# ✓ /en/products                                 XX KB    123 KB
# (other routes...)
```

**Key Metrics from Build Output:**
- Page route should be ~89KB (was ~156KB before)
- Main bundle should be ~198KB (was ~245KB before)

---

### Step 12: Verify Bundle Chunks
```bash
# List all chunks created
ls -lh .next/static/chunks/app* | head -20

# Look for:
# - ProductChart chunk (should exist as separate file)
# - Page chunk (should be smaller than before)
```

**Expected Chunks:**
```
app-[locale]-products-[id]-I18nProductDetailClient-[hash].js    ~89 KB
app-[locale]-products-[id]-ProductChart-[hash].js             ~67 KB (deferred)
app-[locale]-products-page-[hash].js                          ~45 KB
```

---

### Step 13: Check Bundle Size Reduction
```bash
# Compare sizes
du -sh .next/static

# Record: Total static size

# Before optimization: ~450 KB
# After optimization: ~350 KB
# Reduction: ~100 KB (22%)
```

---

## 🧪 Phase 4: Testing & Verification (30 Minutes)

### Step 14: Start Production Server
```bash
# Start production server
npm start

# Expected:
# ▲ Next.js 16.3.2
# - ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Keep this running for testing.**

---

### Step 15: Test Page Loads Fast
```bash
# Open browser to page
# http://localhost:3000/en/products/1

# Steps to verify:
# 1. Page should load and show product in ~1.2-1.6 seconds
# 2. Content should be readable immediately
# 3. No "Loading..." spinner for initial content
# 4. Image should appear with blur placeholder briefly
```

**Visual Checklist:**
- [ ] Product name visible quickly
- [ ] Image appears (with blur effect)
- [ ] Price and description visible
- [ ] Add to Cart button ready
- [ ] No layout shift (content doesn't jump)

---

### Step 16: Test Scroll-Based Chart Loading
```bash
# Steps:
# 1. Page loads (chart should NOT load)
# 2. Open DevTools → Network tab
# 3. Scroll down slowly to "Customer Feedback Analytics"
# 4. Watch Network tab
# 5. Should see ProductChart chunk loading
# 6. Chart should appear with slight delay

# Verify in Console (F12):
# Should see similar loading phases:
# 0.0-1.6s: Main content loads
# 2.0s: User scrolls (you'll do this)
# 2.5-3.0s: Chart chunk loads
# 3.0-3.5s: Chart.js, Plotly, D3 libraries load
# 3.5s+: Chart renders on page
```

---

### Step 17: Lighthouse Audit (After Optimization)
```bash
# In separate terminal, run final audit
lighthouse http://localhost:3000/en/products/1 --view

# Record metrics:
```

| Metric | Before | After | Change | Status |
|--------|--------|-------|--------|--------|
| LCP | ___ ms | ___ ms | -___ ms | ✅ |
| FCP | ___ ms | ___ ms | -___ ms | ✅ |
| CLS | ___ | ___ | -___ | ✅ |
| Speed Index | ___ ms | ___ ms | -___ ms | ✅ |
| Performance | ___ | ___ | +___ | ✅ |

**Expected Results:**
```
LCP: 3.5s → 1.6s (54% faster) ✅
FCP: 2.1s → 1.2s (43% faster) ✅
CLS: 0.15 → 0.02 (87% better) ✅
Performance: 42 → 88 (+46 points) ✅
```

---

### Step 18: Mobile Performance Test
```bash
# Simulate mobile (if different expected)
# DevTools → Device Toolbar → Pixel 5 (or iPhone 12)
# Network: Slow 4G
# CPU: 4x slowdown

# Lighthouse audit on mobile:
lighthouse http://localhost:3000/en/products/1 --view

# Compare mobile vs desktop metrics
```

---

### Step 19: Verify No Errors
```bash
# Check console for errors
# DevTools → Console (F12)

# Expected: No errors, no warnings about missing files
# May see: "Loading analytics..." message (expected)

# If see errors:
# - ProductChart component not found
# - QuantitySelector import error
# - Image optimization syntax error
```

---

## 📝 Phase 5: Documentation & Reporting (20 Minutes)

### Step 20: Fill Performance Metrics Template
```bash
# Open: PERFORMANCE-BASELINE-TEMPLATE.md
# Fill in all metrics:
# - Baseline section (before optimization)
# - Module-by-module improvements
# - Final results comparison
# - Implementation summary
```

---

### Step 21: Document Changes Made
```bash
# Open: PERFORMANCE-OPTIMIZATION-DETAILS.md
# Review:
# - All changes made (ProductChart.dynamic.ts, etc.)
# - Where dynamic imports were used
# - Where code splitting was applied
# - Bundle analysis before/after
# - Testing commands

# Trainer: Walk through this with learners
```

---

### Step 22: Create Performance Report
```bash
# Take screenshots:
# 1. Before optimization (Lighthouse report)
#    Name: baseline-lighthouse.html
# 2. After optimization (Lighthouse report)
#    Name: final-lighthouse.html

# Create comparison:
# Screenshot 1: Network timeline BEFORE
# Screenshot 2: Network timeline AFTER
# Screenshot 3: Lighthouse scores comparison
```

---

## 🎯 Phase 6: Hands-On Lab Exercises (Varies)

### Exercise 1: Image Optimization Deep Dive
```bash
# Task: Modify image quality and see impact
# 1. Change quality from 80 to 70
# 2. Run build: npm run build
# 3. Check file size: du -sh .next/static/
# 4. Run Lighthouse: lighthouse ... --view
# 5. Compare LCP impact

# Expected: Each 10% quality reduction = ~5-10% file size reduction
```

---

### Exercise 2: Dynamic Import Verification
```bash
# Task: Verify dynamic import is working
# 1. Open DevTools Network tab
# 2. Go to http://localhost:3000/en/products/1
# 3. Look for initial JS load (should NOT include ProductChart chunk)
# 4. Scroll down to chart
# 5. Observe new chunk loading

# Record:
# - Initial JS size: ___ KB
# - ProductChart chunk size: ___ KB
# - Load time before scroll: ___ ms
# - Load time for chart chunk: ___ ms
```

---

### Exercise 3: Scroll Detection Testing
```bash
# Task: Test IntersectionObserver behavior
# 1. Open DevTools → Console
# 2. Add this to test:
console.log('Chart should NOT load until scroll');
// Add observer test code

# 3. Scroll slowly, observe loading
# 4. Note: Should see chart placeholder until loaded

# Questions to ask learners:
# - Why defer chart loading?
# - When does scroll detection trigger?
# - What if user doesn't scroll?
```

---

### Exercise 4: Bundle Analysis Challenge
```bash
# Task: Identify other optimization opportunities
# 1. Run: ANALYZE=true npm run build
# 2. Look for largest libraries in bundle
# 3. Question: Could any be optimized further?
# 4. Ideas:
#    - Are all Tailwind classes needed?
#    - Are there unused React components?
#    - Are translations strings too large?

# Run analysis and report findings
```

---

## 🔄 Re-Running During Multiple Training Sessions

### For Training Session 2, 3, etc.:

```bash
# Quick reset for next class
cd c:/Users/Sangeetah/Documents/nextJS/optimized

# Start fresh
rm -rf .next node_modules/.cache

# Run through all steps again:
npm run dev
# [In new terminal]
lighthouse http://localhost:3000/en/products/1 --view
# [Compare metrics]
npm run build
# [Check chunks]
npm start
# [Visual verification]
```

---

## ✅ Verification Checklist for Trainers

Use this to verify everything is working before starting training:

```
SETUP PHASE
[ ] Project cloned and ready
[ ] Node v18+ installed
[ ] npm dependencies installed
[ ] npm run dev works without errors
[ ] npm run build completes successfully

FILES IN PLACE
[ ] ProductChart.dynamic.ts exists (35 lines)
[ ] QuantitySelector.tsx exists (60 lines)
[ ] I18nProductDetailClient.tsx updated with imports
[ ] All imports reference correct paths

FUNCTIONALITY
[ ] Dev server loads PDP without errors
[ ] Image displays with blur placeholder
[ ] Quantity selector works (+ / - buttons)
[ ] Add to cart button works
[ ] Chart doesn't load on initial page load
[ ] Chart loads when scrolling down
[ ] No console errors

PERFORMANCE
[ ] Initial Lighthouse score showing improvement
[ ] Bundle size reduction visible
[ ] ProductChart chunk is separate file
[ ] Page load is noticeably faster

DOCUMENTATION
[ ] PERFORMANCE-TRAINING-GUIDE.md complete
[ ] PERFORMANCE-BASELINE-TEMPLATE.md ready
[ ] PERFORMANCE-OPTIMIZATION-DETAILS.md complete
[ ] Commands reference available
```

---

## 🆘 Troubleshooting During Training

### Issue: ProductChart not lazy loading
```bash
# Check if dynamic import is in place
grep "ProductChart.dynamic" app/\[locale\]/products/\[id\]/I18nProductDetailClient.tsx

# If not found, add import:
# import { DynamicProductChart } from './ProductChart.dynamic';

# Also check IntersectionObserver code is present
grep "IntersectionObserver" app/\[locale\]/products/\[id\]/I18nProductDetailClient.tsx
```

---

### Issue: Build errors
```bash
# Clear and rebuild
rm -rf .next
npm run build

# If still errors, check for typos
npm run lint

# Verify files exist
ls -la app/\[locale\]/products/\[id\]/ProductChart.dynamic.ts
ls -la app/\[locale\]/products/\[id\]/QuantitySelector.tsx
```

---

### Issue: Image not optimizing
```bash
# Verify Image component has all props
grep -A 8 "<Image" app/\[locale\]/products/\[id\]/I18nProductDetailClient.tsx

# Should see:
# - width={600}
# - height={600}
# - quality={80}
# - placeholder="blur"
# - sizes="..."
```

---

## 📊 Before/After Metrics Template (Quick)

**For Quick Reference During Training:**

```
BEFORE:
┌──────────────┬─────────┐
│ LCP          │ 3.5s ⚠️ │
│ FCP          │ 2.1s ⚠️ │
│ CLS          │ 0.15 ⚠️ │
│ Bundle       │ 156 KB ⚠️│
│ Lighthouse   │ 42    ⚠️ │
└──────────────┴─────────┘

AFTER:
┌──────────────┬─────────┐
│ LCP          │ 1.6s ✅ │
│ FCP          │ 1.2s ✅ │
│ CLS          │ 0.02 ✅ │
│ Bundle       │ 89 KB ✅ │
│ Lighthouse   │ 88    ✅ │
└──────────────┴─────────┘

IMPROVEMENT: 54% faster LCP + 88% better Lighthouse
```

---

**Document Version:** 1.0  
**For Training Sessions:** All  
**Last Updated:** 2024  
**Status:** Ready for Use ✅
