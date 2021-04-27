# Render

## Install

```bash
$ npm install @magnite/fledge.polyfill
```

## Usage

```html
<script type="module">
    import { fledge } from "./node_modules/@magnite/fledge.polyfill/esm/index.js";

    // ...run the auction; see auctions docs for full example
    const auctionResults = await fledge.runAdAuction(options);

    fledge.renderAd(id, auctionResults);
</script>
```

## API

### renderAd(id, results)

Returns `null` if no winning bid is found.  Returns a `Promise` with a token representation of the winning bids rendering URL.

If an invalid option is passed, then an `Error` will be thrown with a reason to help debug.

#### id

Type: [`<HTML ID>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id)

The `id` of the element that will be the target for which the ad will render.

#### results

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

A token, or string, that represents the results from an auction run via the `fledge.runAdAuction` call.
