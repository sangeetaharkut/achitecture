# CI/CD Quick Reference

## ✅ What's Set Up

- ✅ GitHub Actions workflow created (`.github/workflows/playwright.yml`)
- ✅ Runs on every PR and push to main
- ✅ Tests all 18 E2E scenarios automatically
- ✅ Uploads reports and failure screenshots
- ✅ Blocks merging if tests fail

##  Next Steps to Enable

### 1. Push to GitHub

```bash
# Add the workflow file
git add .github/workflows/playwright.yml

# Commit with descriptive message
git commit -m "Add CI/CD workflow for Playwright E2E tests"

# Push to your repository
git push origin main
```

### 2. Create a Test PR

```bash
# Create a new branch
git checkout -b test-ci-cd

# Make a small change (e.g., update README)
echo "" >> README.md

# Commit and push
git commit -am "Test CI/CD workflow"
git push origin test-ci-cd
```

### 3. Watch Tests Run

1. Go to GitHub → Your Repository
2. Click **Pull Requests** → Your test PR
3. Scroll to **Checks** section
4. See "Playwright Tests" running ⏳
5. Wait for ✅ green checkmark (or ❌ if failed)

### 4. View Results

**If tests pass:**
- Green checkmark ✅ appears
- PR is ready to merge
- Congratulations! 🎉

**If tests fail:**
- Red X ❌ appears
- Click **Details** → **Summary**
- Download artifacts:
  - `playwright-report` - HTML report
  - `test-results` - Screenshots/videos
- Fix issues and push again

## 🎬 Demo to Learners

### Show CI/CD in Action

```bash
# 1. Open GitHub PR page
# 2. Show "Checks" section
# 3. Click "Playwright Tests" → "Details"
# 4. Show real-time logs
# 5. Download and open HTML report
```

### Explain Each Step

**Workflow steps visible in logs:**
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Install Playwright browsers
5. ✅ Setup database
6. ✅ Build app
7. ✅ Run E2E tests
8. ✅ Upload artifacts

### Show Failure Scenario

```bash
# Intentionally break a test
# e.g., change button text in component

git checkout -b test-failure
# Edit src/features/products/components/ProductCard.tsx
# Change "Add to Cart" to "Add Item"
git commit -am "Test CI failure"
git push origin test-failure
```

**Result:** Tests fail, screenshots show the issue!

## 🔧 Commands Reference

### Local Testing
```bash
npm run test:e2e           # Run all tests
npm run test:e2e:ui        # Interactive mode
npm run test:e2e:headed    # Watch in browser
npm run playwright:report  # View last report
```

### CI Workflow
```bash
# Manually trigger workflow (if enabled)
gh workflow run playwright.yml

# View workflow runs
gh run list

# Download artifacts
gh run download <run-id>
```

## 💡 Tips

### For Developers
- ✅ Run tests locally before pushing
- ✅ Fix failures immediately
- ✅ Keep tests fast (<5 min total)

### For Code Reviews
- ✅ Check CI status before reviewing
- ✅ Review test changes carefully
- ✅ Don't merge failing PRs

### For Demos
- ✅ Use `test:e2e:ui` for visual demos
- ✅ Show HTML reports from CI
- ✅ Demonstrate failure screenshots
- ✅ Compare local vs CI execution

## 📊 What Gets Tested in CI

### User Journey
1. Homepage loads ✅
2. Navigate to products ✅
3. View product details ✅
4. Add to cart from card ✅
5. Add to cart from detail page ✅
6. View cart ✅
7. Update quantities ✅
8. Remove items ✅
9. Clear cart ✅
10. Verify order summary ✅

### Cross-cutting Concerns
- Navigation works ✅
- Images load ✅
- Prices display correctly ✅
- Stock validation ✅
- Error handling ✅
- Loading states ✅

## 🎯 Success Criteria

**Ready to demo when:**
- ✅ GitHub Actions workflow runs
- ✅ Tests pass on a PR
- ✅ Artifacts upload successfully
- ✅ HTML report is readable
- ✅ Failure screenshots work

## 📚 Documentation

- **Full Guide:** [CI-CD-GUIDE.md](CI-CD-GUIDE.md)
- **Testing Guide:** [TESTING.md](TESTING.md)
- **Playwright Guide:** [PLAYWRIGHT-GUIDE.md](PLAYWRIGHT-GUIDE.md)
- **Demo Script:** [DEMO-SCRIPT.md](DEMO-SCRIPT.md)

---

**Status:** ✅ Ready to push and enable CI/CD!

**Time to set up:** ~5 minutes  
**Time per PR:** ~3 minutes for full test run
