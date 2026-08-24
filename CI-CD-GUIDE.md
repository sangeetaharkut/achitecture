# CI/CD Setup Guide - Playwright Tests on Every PR

## Overview

This project is configured to automatically run Playwright E2E tests on every Pull Request using GitHub Actions. This ensures code quality and prevents bugs from reaching the main branch.

## How It Works

### Workflow Configuration

The workflow is defined in `.github/workflows/playwright.yml` and runs automatically on:
- **Pull Requests** to `main` or `master` branches
- **Pushes** to `main` or `master` branches

### What the CI Pipeline Does

1. **Checkout Code** - Gets the latest code from the PR
2. **Setup Node.js** - Installs Node.js v22 with npm caching
3. **Install Dependencies** - Runs `npm ci` for clean install
4. **Install Playwright** - Downloads Chromium browser for testing
5. **Setup Database** - Generates Prisma client, creates database, seeds data
6. **Build Application** - Creates production build of Next.js app
7. **Run E2E Tests** - Executes all 18 Playwright tests
8. **Upload Reports** - Saves test reports and failure screenshots as artifacts

### Test Results

- ✅ **All tests pass** → PR can be merged
- ❌ **Tests fail** → Check uploaded artifacts for details:
  - `playwright-report` - HTML report with test results
  - `test-results` - Screenshots and videos of failures

## Viewing Test Results

### In GitHub

1. Go to the **Pull Request** page
2. Scroll to the **Checks** section at the bottom
3. Click on **Playwright Tests** to see status
4. If tests fail, click **Details** → **Summary** → Download artifacts

### Downloading Reports

```bash
# From PR checks, download artifacts:
# - playwright-report.zip (HTML report)
# - test-results.zip (failure screenshots/videos)

# Extract and open HTML report:
unzip playwright-report.zip
open playwright-report/index.html
```

## Running Tests Locally Before Pushing

### Quick Check (Chromium only)
```bash
npm run test:e2e
```

### Full Test Suite (All browsers)
```bash
npx playwright test
```

### Interactive Mode (Best for debugging)
```bash
npm run test:e2e:ui
```

### Headed Mode (Watch tests run)
```bash
npm run test:e2e:headed
```

## CI Environment Details

### Operating System
- **Ubuntu Latest** (Linux)
- Same as production environments
- Consistent across all PRs

### Node.js Version
- **v22** (same as development)
- Locked to prevent version drift

### Browser
- **Chromium** only (for speed)
- Full cross-browser tests can run locally

### Database
- **SQLite** (same as development)
- Fresh database for each run
- Seeded with 24 test products

### Environment Variables
- **DATABASE_URL**: `file:./dev.db` (set in workflow)
- Configured at job level in `.github/workflows/playwright.yml`
- No secrets needed for SQLite development database
- For production databases, use GitHub Secrets (see Security section)

### Timeout
- **60 minutes** maximum
- Typical run: 2-3 minutes
- Includes build + tests

## Customizing the Workflow

### Test Specific Browsers

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium firefox webkit
```

### Run Parallel Tests

```yaml
- name: Run Playwright tests
  run: npm run test:e2e -- --workers=4
```

### Add Test Sharding (Large Test Suites)

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - name: Run Playwright tests
    run: npm run test:e2e -- --shard=${{ matrix.shard }}/4
```

### Slack/Email Notifications

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

### For Developers

✅ **DO:**
- Run tests locally before pushing
- Fix failing tests immediately
- Keep tests fast and focused
- Use meaningful test descriptions

❌ **DON'T:**
- Skip tests with `.only` or `.skip`
- Commit test artifacts (playwright-report/, test-results/)
- Ignore flaky tests - fix them
- Push without running tests

### For Reviewers

✅ **Check:**
- All CI tests pass ✅
- Test coverage for new features
- No commented-out tests
- Test execution time is reasonable

## Troubleshooting

### Tests Pass Locally But Fail in CI

**Cause:** Timing issues, different environment

**Solution:**
```typescript
// Add explicit waits
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);

// Use more specific selectors
await page.locator('[data-testid="cart-button"]');
```

### CI Times Out

**Cause:** Tests hang or run too long

**Solution:**
```yaml
# Increase timeout
timeout-minutes: 90

# Or reduce test scope
run: npm run test:e2e -- --grep @smoke
```

### Database Setup Fails

**Cause:** Prisma schema issues

**Solution:**
```bash
# Test locally
npx prisma generate
npx prisma db push
npx prisma db seed

# Check schema validity
npx prisma validate
```

### Artifacts Not Uploading

**Cause:** Path mismatch

**Solution:**
```yaml
- name: Upload Report
  uses: actions/upload-artifact@v4
  if: always()  # Upload even if tests fail
  with:
    path: playwright-report/
    if-no-files-found: warn  # Don't fail if missing
```

## Cost Optimization

### GitHub Actions Minutes

- **Free tier:** 2,000 minutes/month
- **Typical test run:** 3 minutes
- **~650 PR builds/month** on free tier

### Reduce Minutes

```yaml
# Only run on PR, not every push
on:
  pull_request:
    branches: [main]

# Cache dependencies
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# Install only chromium
run: npx playwright install --with-deps chromium
```

## Advanced Features

### Matrix Testing (Multiple Node Versions)

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### Conditional Tests

```yaml
# Run full suite on main, smoke tests on PR
- name: Run tests
  run: |
    if [ "${{ github.event_name }}" == "pull_request" ]; then
      npm run test:e2e -- --grep @smoke
    else
      npm run test:e2e
    fi
```

### Deploy Preview with Tests

```yaml
- name: Deploy to Vercel Preview
  run: vercel deploy --prebuilt
  
- name: Test Preview
  run: npm run test:e2e
  env:
    BASE_URL: ${{ steps.vercel.outputs.preview-url }}
```

## Security Considerations

### Secrets Management

For **production databases** or sensitive environment variables, use GitHub Secrets:

```yaml
# Add in GitHub Settings → Secrets and Variables → Actions
- name: Run tests
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    API_KEY: ${{ secrets.API_KEY }}
```

**Note:** This project uses SQLite with `DATABASE_URL: file:./dev.db` which is safe to commit in the workflow file since it's a local file database with no credentials.

For **PostgreSQL/MySQL** in CI, you would use:
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  # Example: postgresql://user:password@host:5432/dbname
```

### Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Action Artifacts](https://docs.github.com/actions/using-workflows/storing-workflow-data-as-artifacts)

## Next Steps

1. ✅ Workflow file created
2. ✅ Push to GitHub
3. ✅ Create a test PR
4. ✅ Watch tests run automatically
5. ✅ Review artifacts on failure

---

**Status:** ✅ CI/CD Ready - Playwright tests will run on every PR!
