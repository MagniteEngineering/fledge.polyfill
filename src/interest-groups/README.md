# Interest Groups

## Install

```bash
$ npm install @magnite/fledge.polyfill
```

## Usage

```html
<script type="module">
    import fledge from "./node_modules/@magnite/fledge.polyfill.js";

    const options = {
        owner: "www.buyer.com",
        name: "an-interest-group",
        bidding_logic_url: "https://dsp.com/bidding",
    };
    const expiry = 864000000; // 10 days from now
    fledge.joinAdInterestGroup(options, expiry);
</script>
```

## API

### joinAdInterestGroup(options, expiry)

Returns `true` and creates an entry in a cross-domain Indexed dB store.

If an invalid option is passed, then an `Error` will be thrown with a reason to help debug.

#### options

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

The following is the data structure with types for the options:

```ts
interface InterestGroup {
  owner: typeof string;
  name: typeof string;
  bidding_logic_url: typeof url;
  daily_update_url?: typeof url;
  trusted_bidding_signals_url?; typeof url;
  trusted_bidding_signals_keys?: typeof array;
  user_bidding_signals?: typeof object;
  ads?: typeof array;
}
```

Options that are passed to the `createInterestGroup` function.

#### expiry

Type: [`<Number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)

A number of days (set in milliseconds) that the Interest Group will remain active, with a maximum of 30 days (or 2592000000).

### leaveAdInterestGroup(group)

Returns `true` and removes an entry in a cross-domain Indexed dB store.

If an invalid option is passed, then an `Error` will be thrown with a reason to help debug.

#### options

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

The following is the data structure with types for the options:

```ts
interface InterestGroup {
  owner: typeof string;
  name: typeof string;
  bidding_logic_url?: typeof url;
  daily_update_url?: typeof url;
  trusted_bidding_signals_url?; typeof url;
  trusted_bidding_signals_keys?: typeof array;
  user_bidding_signals?: typeof object;
  ads?: typeof array;
}
```

Options that are passed to the `deleteInterestGroup` function.
