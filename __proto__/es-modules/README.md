# ES Modules Prototype

The following is meant to showcase ES Modules support in modern browsers, particularly the ones that will be required to support the Fledge proposal when it is released. 

Following the [discussion in GitHub](https://github.com/MagniteEngineering/fledge.polyfill/discussions/9), this will be used in how we recommend and expose the `score_ad` and `report_result` functions for sellers and `generate_bid` and `report_win` functions for buyers.

## Support 

As of this experiment, the earliest version of Chrome that would contain Fledge support would be v91, which is set to be released in June of 2021. According to [MDN's Guide to Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), full support for ES modules is as follows, which means any browser supporting Fledge would support ES modules.

![Can I Use ES Module Support](https://caniuse.bitsofco.de/image/es6-module.jpg)<br />
[source](https://caniuse.com/es6-module)

![Can I Use Dynamic Import Support](https://caniuse.bitsofco.de/image/es6-module-dynamic-import.jpg)<br />
[source](https://caniuse.com/es6-module-dynamic-import)

