# Auction

## Install

```bash
$ npm install @magnite/fledge.polyfill
```

## Usage

```html
<script type="module">
    import { fledge } from "./node_modules/@magnite/fledge.polyfill/esm/index.js";

    const options = {
        "seller": "www.seller.com",
        "decision_logic_url": "https://ssp.com/auction",
        "interest_group_buyers": [
            "www.buyer1.com",
            "www.buyer2.com",
        ],
    };

    const auctionResults = await fledge.runAdAuction(options);
</script>
```

## API

### runAdAuction(options)

Returns `true` and creates an entry in a cross-domain Indexed dB store.

If an invalid option is passed, then an `Error` will be thrown with a reason to help debug.

#### options

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

The following is the data structure with types for the options:

```ts
interface AuctionOptions {
  seller: typeof string;
  decision_logic_url: typeof url;
  interest_group_buyers: typeof array;
  trusted_scoring_signals_url?; typeof url;
  additional_bids?: typeof array;
  auction_signals?: typeof object;
  seller_signals?: typeof object;
  per_buyer_signals?: typeof object;
}
```
