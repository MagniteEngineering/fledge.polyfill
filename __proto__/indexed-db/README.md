# `IndexedDB` Prototype

The following is meant to showcase `IndexedDB` support in modern browsers, particularly the ones that will be required to support the Fledge proposal when it is released. 

Following discussions [#5](https://github.com/MagniteEngineering/fledge.polyfill/discussions/5), [#6](https://github.com/MagniteEngineering/fledge.polyfill/discussions/6) and [#7](https://github.com/MagniteEngineering/fledge.polyfill/discussions/7), this will be used in how store the data around Interest Groups, bids, and auctions.  As such, we need to verify its capabilities as well as limits to ensure this is the most appropriate choice of technology currently available.

## Support 

As of this experiment, the earliest version of Chrome that would contain Fledge support would be v91, which is set to be released in June of 2021. According to [MDN's Guide to IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), full support is as follows, which means any browser supporting Fledge would support IndexedDB.

<picture>
	<source type="image/webp" srcset="https://caniuse.bitsofco.de/image/indexeddb.webp">
	<source type="image/png" srcset="https://caniuse.bitsofco.de/image/indexeddb.png">
	<img src="https://caniuse.bitsofco.de/image/indexeddb.jpg" alt="Data on support for the indexeddb feature across the major browsers from caniuse.com">
</picture><br />
[source](https://caniuse.com/indexeddb)


## Running the Demo

### The Basics

This demo is hosted in the `basic/` directory and showcases the level of browser support.  Through this demo you should see that each refresh of the page will add a new item into the `dB` with an incremental ID.

To run the demo, insure you have the dependencies required by running `npm install` in the immediate parent directory (`indexed-db`).  Then `cd` into the `basic` directory and run `npx serve`.
