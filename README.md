# gulp-bundle-libs

Use to copy or concat resource files from the node module directory into your project directory.

## Usage

First, install `gulp-bundle-libs` as a development dependency:

```shell
npm install --save-dev gulp-bundle-libs
```

Then, add it to your `gulpfile.js`:

```js
const gulp = require('gulp');
const bundleLibs = require('gulp-bundle-libs');

gulp.task('libs', function(){
    return gulp
      .src('libs.json')
      .pipe(bundleLibs({
        profiles: ['default', 'dist']
      }))
      .pipe(gulp.dest('libs/build'));
});
```

This will process the following configuration file `libs.json`. But only the profiles `default` and `dist`.

```json
{
  "default": {
    "styles.css@concat": [
      "bootstrap/dist/bootstrap.css"
    ],
    "fonts@copy": [
      "bootstrap/dist/fonts/*",
      "font-awesome/fonts/*"
    ]
  },
  "dev": {
    "libs.js@concat": [
      "jquery/dist/jquery.js",
      "angular/angular.js"
    ]
  },
  "dist": {
    "libs.js@concat": [
      "jquery/dist/jquery.min.js",
      "angular/angular.min.js"
    ]
  }
}
```

### Configuration file

The configuration file is used to specify operation profiles and operations.

```json
{
  "profileA": {
    ...
  },
  "profileB": {
    ...
  }
}
```

#### Operations

#### copy
Used to copy the specified files from the `node_modules` directory into the `destination-directory`.
```js
"<destination-directory>@copy": [
  "<source-directory>/*",
  "<source-file>"
]
```

#### concat
Used to concat the files from the `node_modules` directory into the `destination-file`.
```js
"<destination-file>@concat": [
  "<source-directory>/*",
  "<source-file>"
]
```

### Options

#### profiles
Type: `Array`

Defines the profiles to be processed.

#### moduleDirectory
Type: `String`

Alternate node module directory path.
