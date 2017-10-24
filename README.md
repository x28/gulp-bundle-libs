## Installation

Install package with NPM and add it to your development dependencies:

`yarn add gulp-bundle-libs --dev`

## Usage

```js
const gulp = require('gulp');
const bundleLibs = require('gulp-bundle-libs');

gulp.task('libs', function(){
    return gulp
      .src('libs.json')
      .pipe(bundleLibs({prefix: true}))
      .pipe(gulp.dest('libs/build'));
});
```

This will process the following configuration file `libs.json

```json
{
  "dist": {
    "libs.js@concat": [
      "jquery/dist/jquery.min.js",
      "angular/angular.min.js"
    ],
    "styles.css@concat": [
      "bootstrap/dist/bootstrap.css"
    ],
    "fonts@copy": [
      "bootstrap/dist/fonts/*",
      "font-awesome/fonts/*"
    ]
  }
}
```

`dist` is a prefix. You can have many prefixes like `app`, `public`, `common` etc. in the same file. The prefix is only prepended if the config option `prefix` is enabled.

`libs.js@concat` defines the output file or folder (only on copy operation) and the operation `copy` or `concat` followed by an array of file names relative to the `node_modules` directory.