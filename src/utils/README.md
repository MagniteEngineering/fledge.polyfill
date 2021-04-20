# Utilities

## Usage

```javascript
import db from "db.js";

// create an entry in the IndexedDB
await db.create(options, expiry);

// read an entry from the IndexedDB
await db.read(owner, name);

// update an entry in the IndexedDB
await db.update(group, options, expiry);

// delete an entry from the IndexedDB
await db.delete(group);
```

## API

### db.create(options, expiry)

Returns a `Promise`, which resolves to the `key` of the entry. and creates an entry in an Indexed dB store.

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

A number of days (set in milliseconds) that the Interest Group will stay active, with a maximum of 30 days (or 2592000000).

### db.read(owner, name)

Returns a `Promise`, which resolves to the entry as an `Object` from the Indexed dB store.

#### owner

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

A string that represents the owner of the group.

#### name

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

A string that represents the name of the group.

### db.update(group, owner, name)

Returns a `Promise`, which resolves to the `key` of the entry and updates an entry in an Indexed dB store.

#### group

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

An object representing the current group to update.

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

A number of days (set in milliseconds) that the Interest Group will stay active, with a maximum of 30 days (or 2592000000).

### db.delete(group)

Returns a `Promise`, which resolves to `undefined`, which removes an entry from the Indexed DB

#### group

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

An object representing the current group to update.
