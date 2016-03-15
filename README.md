Active Angular (WIP)
========

ng-resource on steroids

## Running greenLight-starter

###Install dependencies

  - $ npm install -g gulp karma-cli protractor
  - $ npm install
  - $ brew install mongodb
  - $ ./node_modules/.bin/webdriver-manager update

### Linting
 - Run code analysis using `gulp vet`. This runs jshint, jscs.

### Tests
 - Run all tests using `gulp test` (via karma, mocha, sinon).

### e2e
  - Run e2e tests using `gulp e2e`
  - Build first before running e2e `gulp e2e-build`

### web unit tests
  - Run web unit tests using `gulp web:test`
  - Run web unit tests auto restart using `gulp web:test-auto`

### Running in dev mode
 - Run the project with `gulp serve-dev`

 - opens it in a browser and updates the browser with any files changes.

### Building the project
 - Build the optimized project using `gulp build`
 - This create the optimized code for production and puts it in the build folder

### Running the optimized code
 - Run the optimize project from the build folder with `gulp serve-build`

## License

MIT
