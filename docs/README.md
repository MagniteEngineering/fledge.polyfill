# Prototypes

Any discussion or open question that may have been posed from our initial tech spec, this is our attempt to answer those questions.

The two biggest categories of prototypes revolve around [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) and [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

<!-- toc -->

- [Cross-Domain](#cross-domain)
  * [Running the Demo](#running-the-demo)
- [ES Modules](#es-modules)
  * [Basic](#basic)
  * [Running the Demo](#running-the-demo-1)
  * [Dynamic](#dynamic)
  * [Running the Demo](#running-the-demo-2)
  * [Auction](#auction)
  * [Running the Demo](#running-the-demo-3)
- [Indexed dB](#indexed-db)
  * [Running the Demo](#running-the-demo-4)

<!-- tocstop -->

## Cross-Domain

This demo was setup to answer the question of the possibility for posting data to `IndexedDB` through an iframe hosted on a separate domain.

### Running the Demo

You will need to run a server for both HTML files within the each of the subsequent directories.  Using `npx serve __proto__/cross-domain` within the current working directory would suffice.  It will provide you a URL that you can paste into the browser. But you'll need to find a way to serve it with a different domain to truly test the cross-domain message posting.  Hosting one file using a service like <https://glitch.com> or <https://github.com> are both viable options.

From that URL, you should see that the `index.html` page is calling a script and in order to confirm that groups were stored, check in the DevTools "Application" tab under the "IndexedDB" tab.

## ES Modules

Within the `es-modules` are 3 prototypes:

1. [basic](./basic)
2. [dynamic](./dynamic)
3. [auction](./auction)


### Basic

The **basic** demo was set up to answer the question of support for loading a script on a webpage using ES Modules.

The answer is _yes we can_.

### Running the Demo

You will need to run a server within the current directory.  Using `npx serve __proto__/es-modules/basic` within the current working directory would suffice.  It will provide you a URL that you can paste into the browser. 

From that URL, you should see that the `index.html` page is calling a script which imports an ES module from another file.

### Dynamic

The **dynamic** demo was set up to answer the question of whether one can import a script from an outside the hosted domain and whether the file path can be a template literal rather than only a string literal.

The answer is _yes we can_.

### Running the Demo

You will need to run a server within the current directory.  Using `npx serve __proto__/es-modules/dynamic` within the current working directory would suffice.  It will provide you a URL that you can paste into the browser. 

From that URL, you should see that the `index.html` page is calling a script which imports an ES module from a URL that is hosted on a completely different domain.

### Auction

The **auction** demo was set up to showcase what an auction might look like importing the various logic URLs using ES Modules.

### Running the Demo

You will need to run a server within the current directory.  Using `npx serve __proto__/es-modules/auction` within the current working directory would suffice.  It will provide you a URL that you can paste into the browser. 

From that URL, you should see that the `index.html` page is calling a few scripts that should simulate what an auction might look like in the end.

## Indexed dB

Within the `indexed-db`, there is only 1 demo.

The demo was set up to answer the question of if `IndexedDB` would be an appropriate solution for storing the interest groups including updates to items and removing items.

The answer is _yes we can_.

### Running the Demo

This demo requires a bit more setup, so in order to get started you need to `cd __proto__/indexed-db` and run `npm install` in order to install the dependencies required.  Using `npx serve __proto__/indexed-db` within the current working directory would suffice.  It will provide you a URL that you can paste into the browser. 

From that URL, you should see that the `index.html` page is calling a script and in order to confirm that groups were stored, check in the DevTools "Application" tab under the "IndexedDB" tab.
