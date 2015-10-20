# turbine-gulp-sandbox

This project provides gulp tasks for creating a sandbox in which you can manually test your extension. In addition to building web pages as starting points, this project builds the Turbine engine as well as a Turbine container to be used within those web pages. A Turbine container contains code specific to a particular DTM property. It will contain code from extensions installed for the property as well as configurations of the property, extensions, data elements, and rules. Both the container and the engine are necessary for DTM to be of much use.

In order to create a sandbox within your project, add turbine-gulp-sandbox to the `devDependencies` of your project's `package.json` and `npm install` it. In your `gulpfile.js`, require the builder and pass in your gulp instance as follows:

```javascript
var gulp = require('gulp');
require('turbine-gulp-sandbox')(gulp);
```

## Building

To build the sandbox, run `gulp sandbox` from the command line within your project's directory. You will notice two directories produced within your project:

* `sandboxTemplates` - This contains a template for the container as well as templates HTML pages you may use to manually test the library and view portions of your extension. These files will not be overwritten when you run `gulp sandbox` again.
  * `container.txt` can be modified, for example, to contain rules or data elements you would like to manually test. This template will be used to product a complete container.js that can be used in tandem with the Turbine engine that will also be built.
  * `libSandbox.html` includes script tags to load the Turbine engine and container and can be modified to manually test whatever you would like. For example, if you're testing that your awesome new "focus" event delegate works, you can add a text input to the web page to ensure your dummy rule fires when a form element receives focus.
  * `viewSandbox.html` includes the necessary tools to load your extension views into an iframe. Along with being able to see what your views look like, you can test the APIs for validating, retrieving a configuration object, etc.

* `sandbox` - This contains the built container and engine as well as the HTML test pages. The files listed below will be overwritten as they are built and should be considered very temporary.
  * `container.js` is compiled using the `container.txt` file found in `sandboxTemplates`. All of the delegate and resource portions of `container.txt` are populated using any extensions found in your project. This includes your project itself if it is an extension as well as any extensions found in your project's `node_modules`. As such, if you would like to include other extensions in the container, `npm install` those extensions as dependencies of your project and run `gulp sandbox` again.
  * `engine.js` is built from the `turbine` project.
  * `libSandbox.html` is copied from `sandboxTemplates`.
  * `viewSandbox.html` is copied from `sandboxTemplates` but it is also populated with data about your extension that will help you test your extension views. This data is derived from your extension's `extension.json` file.

You will notice that a server starts which serves `libSandbox.html` at `http://localhost:7000/libSandbox.html`. Use this to manually test whatever you're developing. As you make changes to your source files or the sandbox templates, gulp should automatically rebuild and update your browser.

It is recommended you don't commit `sandboxTemplates` or `sandbox` into your version control system.

## Preprocessing extension views

As mentioned previously, this project provides a sandbox by which you can manually test your extension's views. It may be that your extension views require some preprocessing. Maybe your views use JSX, Stylus, or some other tech that needs preprocessing before they can be displayed within the sandbox. To handle these cases, create a gulp task that performs the preprocessing and pass the name of that task to turbine-gulp-sandbox as follows:

```javacript
var gulp = require('gulp');

gulp.task('buildView', function() {
  // Process your view here.
});

require('turbine-gulp-sandbox')(gulp, {
  buildViewTask: 'buildView'
});
```

By doing so, your task will also be run when running `gulp sandbox`.

## Cleaning

If you ever want to remove the sandbox-related files from your project you can run `gulp sandbox:clean`.
