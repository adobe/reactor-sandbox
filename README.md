# @adobe/reactor-sandbox

[![npm (scoped)](https://img.shields.io/npm/v/@adobe/reactor-sandbox.svg?style=flat)](https://www.npmjs.com/package/@adobe/reactor-sandbox)

This project provides a sandbox in which you can manually test your Launch extension. You can test both (1) your views that will eventually appear in the Launch application and (2) your library logic that will eventually run on the user's website.

For more information regarding Launch, please visit our [product website](http://www.adobe.com/enterprise/cloud-platform/launch.html).

## Running the Sandbox

Before running the sandbox, you must first have [Node.js](https://nodejs.org/en/) installed on your computer. Your npm version (npm comes bundles with Node.js) will need to be at least 5.2.0. You can check the installed version by running the following command from a command line:
                                                                                                      
```
npm -v
```

Once Node.js is installed, run the sandbox by executing the following command from the command line within your project's directory:

```
npx @adobe/reactor-sandbox
```

A server will be started at [http://localhost:3000](http://localhost:3000) (HTTP) and [https://localhost:4000](https://localhost:4000) (HTTPS). If you navigate to one of addresses in your browser (you may have to accept a security certificate if you use the HTTPS server), you will see the View Sandbox which allows you to test your views. You'll need to have previously created a view in your extension for it to show up in the sandbox. You can switch between views you would like to test using the controls toward the top of the page.

You may also click on the "Go to library sandbox" button at the top-right of the page to navigate to the library sandbox where you can test your library logic. See [Configuring the Sandbox](#configuring-the-sandbox) for how to configure the library sandbox for proper testing.


Once this is in place, you may then run the sandbox by executing the command `npm run sandbox` from the command line.

## Configuring the Sandbox

To configure the Library Sandbox portion of the sandbox that allows you to test your library logic, execute the following command from the command line within your project's directory:

```
npx @adobe/reactor-sandbox init
```

This will generate a directory within your project named `.sandbox` that contains two files you may edit to configure the sandbox:

  * `container.js` When Launch publishes a library, it consists of two parts: (1) a data structure that stores information about saved rules, data elements, and extension configuration and (2) an engine to operate on such a data structure. `container.js` is the data structure (not the engine) that you may modify to simulate saved rules, data elements, and extension configuration. This template will be used to produce a complete `container.js` (JavaScript from your extension will be added) which will be used in tandem with the Turbine engine inside the sandbox. We have tried to provide inline comments on how to modify `container.js`, but if you need further help, please [let the Launch team know](https://developer.adobelaunch.com/guides/extensions/development-resources/) and we can help you out.
  * `libSandbox.html` includes some simple HTML along with script tags to load a complete `container.js` and the Turbine engine. `libSandbox.html` can be modified to manually test whatever you would like. For example, if you'd like to test that your brand new "focus" event type is working as desired, you can add a text input to the `libSandbox.html` to ensure your dummy rule fires when a form element receives focus.

You are welcome to commit `.sandbox` to your version control repository.

## Installing as a Dependency

If you find yourself using the the sandbox tool frequently, you may wish to install it as a dependency in your project. This will allow the sandbox tool to run more quickly and provide more control over when you upgrade to newer versions of the sandbox.

If you do not yet have a `package.json` in your project's directory, you will need to generate one by running the following command from the command line within your project's directory: 
 
```
npm init
```

You will need to provide the information requested on the screen. The values you provide are not particularly important and will not affect how your extension operates. After this process is complete, you should have a file called `package.json` inside your directory.

Once you have a `package.json`, you can install the sandbox as a dependency by running the following command from the command line within your project's directory:

```
npm i -D @adobe/reactor-sandbox
```

At this point, you can continue running the sandbox as outlined above.
