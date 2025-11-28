# Pre-Deployment Checklist

## ✅ Completed
- [x] Frontend build successful (`npm run build`)
- [x] No linting errors
- [x] TypeScript compilation successful

## 🔍 Critical: Test Backend Locally First

**Before deploying to AWS, test the backend locally to catch issues early and save costs.**

### Step 1: Install Amplify Dependencies

```bash
cd amplify
npm install
cd ..
```

**Expected**: Should install without errors. If you see peer dependency warnings, that's okay (we're using compatible versions).

### Step 2: Test Backend Build/Sandbox

```bash
# Option A: Test sandbox (recommended - creates temporary AWS resources)
npx ampx sandbox

# Option B: Just test the build without deploying
cd amplify
npx ampx pipeline-deploy --help  # This will validate the setup
```

**What to check:**
- ✅ No TypeScript errors
- ✅ No CDK schema version errors
- ✅ Backend synthesizes successfully
- ✅ All Lambda functions are recognized
- ✅ EventBridge rules are created
- ✅ Function URLs are configured

**If sandbox works**: You're 95% ready for AWS deployment!

**If sandbox fails**: Fix issues locally before deploying to AWS.

## 📋 Pre-Deployment Checklist

### Backend Verification
- [ ] Amplify dependencies installed (`cd amplify && npm install`)
- [ ] Backend builds successfully (test with sandbox or build command)
- [ ] No TypeScript errors in `amplify/` folder
- [ ] All Lambda functions compile
- [ ] EventBridge schedules are configured correctly
- [ ] Function URLs are set up correctly

### Configuration Files
- [ ] `amplify.yml` is correct (already updated ✅)
- [ ] `amplify/package.json` has correct versions (already updated ✅)
- [ ] `package.json` has correct versions (already updated ✅)
- [ ] No `package-lock.json` conflicts (will be regenerated on AWS)

### Code Review
- [ ] All imports resolve correctly
- [ ] No deprecated API usage
- [ ] Runtime syntax (`runtime: 20`) is correct
- [ ] Resource access patterns (`backend.*.resources.*`) are correct

### Git Status
- [ ] All changes committed
- [ ] Ready to push to branch
- [ ] Consider testing in a feature branch first (recommended)

## 🚀 Deployment Strategy

### Recommended: Test Branch First

1. **Create a test branch:**
   ```bash
   git checkout -b test/package-updates
   git add .
   git commit -m "Update packages to latest versions"
   git push origin test/package-updates
   ```

2. **Monitor AWS Amplify build:**
   - Watch the build logs in AWS Amplify Console
   - Check for any errors during:
     - Dependency installation
     - Backend synthesis
     - Frontend build
     - Deployment

3. **If build succeeds:**
   - Test the deployed app
   - Verify authentication works
   - Check Lambda functions execute
   - Verify EventBridge schedules

4. **If everything works:**
   - Merge to your main/dev branch
   - Deploy to production

### Direct Deployment (If Confident)

If you're confident and have tested locally:

```bash
git add .
git commit -m "Update packages to latest versions"
git push origin <your-branch>
```

## ⚠️ What to Watch For During AWS Build

### Backend Build Phase
Watch for these errors in AWS Amplify build logs:

1. **CDK Schema Version Mismatch**
   - Error: "Maximum schema version supported is X.x.x, but found Y.0.0"
   - **Fix**: Already resolved by upgrading `@aws-amplify/backend-cli` to v1.10.0+

2. **Package Installation Errors**
   - Error: "ERESOLVE unable to resolve dependency"
   - **Fix**: Check `amplify/package.json` versions are compatible

3. **TypeScript Errors**
   - Error: "Cannot find module" or type errors
   - **Fix**: Verify all imports are correct

4. **Runtime Errors**
   - Error: "runtime: 20" not recognized
   - **Fix**: Should work with v1.18.0, but verify

### Frontend Build Phase
Watch for:

1. **Build Errors**
   - TypeScript compilation errors
   - Missing dependencies
   - Import resolution errors

2. **Runtime Warnings**
   - Deprecated API usage
   - Console warnings

## 🔄 Rollback Plan

If deployment fails:

### Quick Rollback
```bash
# Revert package.json files
git checkout HEAD~1 -- package.json amplify/package.json scripts/package.json amplify.yml

# Commit and push
git commit -m "Rollback package updates"
git push origin <your-branch>
```

### Partial Rollback (If Only One Package Fails)
1. Identify the problematic package
2. Pin it to previous version in `package.json`
3. Commit and redeploy

## 📊 Success Criteria

Deployment is successful if:

- ✅ Backend builds without errors
- ✅ Frontend builds without errors
- ✅ All Lambda functions deploy
- ✅ EventBridge schedules are created
- ✅ Function URLs are accessible
- ✅ Authentication works
- ✅ GraphQL API works
- ✅ No runtime errors in CloudWatch logs

## 🎯 Next Steps After Successful Deployment

1. **Monitor CloudWatch Logs**
   - Check Lambda function logs
   - Verify no runtime errors
   - Monitor EventBridge execution

2. **Test Critical Functionality**
   - User sign up/sign in
   - GraphQL queries/mutations
   - Lambda function invocations
   - EventBridge scheduled tasks

3. **Update Documentation**
   - Document any issues encountered
   - Update version numbers in docs
   - Note any configuration changes

## 💡 Pro Tips

1. **Test Locally First**: Always test with `npx ampx sandbox` before deploying
2. **Use Feature Branches**: Test in a branch before merging to main
3. **Monitor Build Logs**: Watch the AWS Amplify build in real-time
4. **Have Rollback Ready**: Keep previous versions committed
5. **Test Incrementally**: Test one component at a time if possible

## ❓ Troubleshooting

### If Backend Build Fails Locally

1. **Clear node_modules:**
   ```bash
   cd amplify
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check CDK Version:**
   ```bash
   npx cdk --version
   ```

3. **Verify Amplify CLI:**
   ```bash
   npx ampx --version
   ```

### If AWS Build Fails

1. Check build logs for specific error
2. Compare with local build output
3. Verify `amplify.yml` commands are correct
4. Check AWS Amplify Console for detailed error messages

---

**Ready to deploy?** Start with Step 1 (test backend locally) before pushing to AWS!

