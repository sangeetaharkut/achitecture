# Performance Optimization Baseline & Metrics Template

## Part 1: BASELINE MEASUREMENTS (Before Optimization)

### 1.1 Baseline Capture Date
**Date & Time:** _______________  
**Environment:** [ ] Development [ ] Production  
**Browser:** [ ] Chrome [ ] Firefox [ ] Safari [ ] Edge  
**Device:** [ ] Desktop (1920x1080) [ ] Tablet (768px) [ ] Mobile (375px)  
**Network Throttling:** [ ] No throttle [ ] Fast 3G [ ] Slow 4G

---

### 1.2 Lighthouse Audit (Baseline)

**Command Run:**
```bash
npm run dev
lighthouse http://localhost:3000/en/products/1 --view
```


### 1.3 Bundle Analysis

**Command Run:**
```bash
npm run build:analyze
```

### 3.5 Visual Before/After Comparison

**Baseline (Slow - 3.5s LCP):**
```
