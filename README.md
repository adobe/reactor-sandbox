# turbine-gulp-builder

This project provides gulp tasks for building the Turbine engine as well as a Turbine container and can help in testing your project. A turbine container contains code specific to a particular property. It will contain code from extensions installed for the property as well as configurations of the property, extensions, data elements, and rules. Both the container and the engine are necessary for Turbine to be of much use.

In order to use this builder within your project, add it to the `devDependencies` of the project's `package.json` and `npm install` it. In your `gulpfile.js`, require the builder and pass in your gulp instance as follows:

```javascript
var gulp = require('gulp');
require('turbine-gulp-builder')(gulp);
```

## Building

To build the engine and container, run `gulp` from the command line within your project's directory. You will notice two directories produced within your project:

* `buildTemplates` - This contains a template for the container as well as a template for an HTML test page. These files will not be overwritten when you run `gulp` again.
  * `container.txt` can be modified, for example, to contain rules or data elements you would like to manually test.
  * `index.html` can be modified to manually test whatever you would like. It includes script tags to load the engine and container.

* `dist` - This contains the built container and engine as well as an HTML test page. These files will be overwritten as they are built and should be considered very temporary.
  * `container.js` is compiled using the `container.txt` file found in `buildTemplates`. All of the delegate and resource portions of `container.txt` are populated using any extensions found in your project. This includes your project itself if it is an extension as well as any extensions found in your project's `node_modules`. As such, if you would like to include other extensions in the container, `npm install` those extensions as dependencies of your project and run `gulp` again.
  * `engine.js` is built from the `turbine` project.
  * `index.html` is copied from `buildTemplates`.

You will notice that a server starts which serves `index.html` at `http://localhost:7000`. Use this to manually test whatever you're developing. As you make changes to your source files or the build templates, gulp should automatically rebuild and update your browser.

It is recommended you don't commit `buildTemplates` or `dist` into your version control system.
