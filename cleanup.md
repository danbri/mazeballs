# CTNet Reorganization Cleanup Checklist

## Status Summary
We've successfully created a new, cleaner directory structure for the mazeballs project with the continuous-time-networks module as a subfolder. Many files have been copied over, but there's still more work to complete the migration.

## ✅ Completed Tasks

- [x] Created basic directory structure for new repo layout
- [x] Created top-level README.md
- [x] Created continuous-time-networks README.md
- [x] Created package.json with appropriate configuration
- [x] Created rollup.config.js for building the library
- [x] Copied core source files (ctNet.js, backends.js)
- [x] Created index.js with proper exports
- [x] Copied test files
- [x] Set up Jest configuration (jest.config.js)
- [x] Created .gitignore file
- [x] Created example network definition (beer_oscillator.json)
- [x] Created browser examples (network-loader.html)
- [x] Created examples README.md
- [x] Created demos README.md
- [x] Copied CLAUDE.md with development notes and merged information from multiple sources
- [x] Copied basic demo files (browser_demo.html, enhanced-browser-demo.html)
- [x] Copied browser test runner (unit-tests.html)
- [x] Copied Node.js examples (basic-oscillator.js, direct-oscillator.js)

## 📝 Remaining Tasks

- [ ] Build system verification:
  - [ ] Test rollup build process
  - [ ] Verify dist files are generated correctly
  
- [ ] Test framework setup:
  - [ ] Verify Jest tests run correctly
  - [ ] Ensure browser tests work correctly
  
- [ ] Demo and example completion:
  - [ ] Create backend selection example
  - [ ] Create additional browser examples
  - [ ] Ensure all demos work with the new file structure
  - [ ] Fix any broken paths in copied files
  
- [ ] Offline support:
  - [ ] Create vendor directory with required dependencies
  - [ ] Update demos to use vendored dependencies when offline
  
- [ ] Documentation improvements:
  - [ ] Update all relative file paths in documentation
  - [ ] Expand API documentation
  - [ ] Add additional network definition examples
  
- [ ] Licensing:
  - [ ] Create Apache 2.0 LICENSE file

## 🛠️ How to Proceed

1. **First steps**:
   - Test the build system to verify it works
   - Run tests to ensure core functionality works
   - Fix any path issues in copied files

2. **Critical checks**:
   - Verify that demos work in the new structure
   - Ensure all examples run correctly
   - Check that all required files have been copied

3. **Final steps**:
   - Complete remaining documentation
   - Add missing examples
   - Set up offline support
   - Create LICENSE file

## 📋 File Path Updates Needed

Files that likely need path updates after being copied:
- browser_demo.html
- enhanced-browser-demo.html
- unit-tests.html
- Any examples that reference library files

Update paths from:
```
../ctnet-library/dist/ctnet-library.js
```

To:
```
../../dist/ctnet.js
```

## 📦 NPM Package Setup

When ready to publish:
1. Update package.json with final details
2. Build the distribution files
3. Test installation from local package
4. Publish to NPM with `npm publish`