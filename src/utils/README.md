# Utilities

## Usage

```javascript
import db from "db.js";

// get an entry from the IndexedDB store
await db.store.get(store, id);

// get all entries from the IndexedDB store
await db.store.getAll(store);

// add an entry in the IndexedDB
await db.store.add(store, options);

// update an entry in the IndexedDB
await db.store.put(store, item, newOptions);

// delete an entry from the IndexedDB
await db.store.delete(store, id);

// validate an object has required keys
validate.hasRequiredKeys(object, keys)

// print out any invalid options based on their types 
validate.printInvalidOptionTypes(options, invalid, types)

// validates data types
validate.type

// validate parameter types passed to a function
validate.param(param, type)

// validates options passed to a function are the correct data types
validate.hasInvalidOptionTypes(options, types)

```

## API

### db

A light wrapper for the [`idb`](https://github.com/jakearchibald/idb) library, which is itself a wrapper for IndexedDB.

#### db.store.get(store, id)

Returns a `Promise`, which resolves to the entry as an `Object` from the Indexed dB store.

##### store

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

The name of the store in IndexedDB.

##### id

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

A string that represents the key of the entry; should match the `_keyPath`.

#### db.store.getAll(store)

Returns a `Promise`, which resolves to an array of entries as an `Object` from the Indexed dB store.

##### store

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

The name of the store in IndexedDB.

#### db.store.add(store, options)

Returns a `Promise`, which resolves to the `key` of the entry. and creates an entry in an Indexed dB store.

##### store

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

The name of the store in IndexedDB.

##### options

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

The following is the data structure with types for the options:

```ts
interface InterestGroup {
  _expires: typeof number;
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

#### db.store.put(store, item, newOptions)

Returns a `Promise`, which resolves to the `key` of the entry and updates an entry in an Indexed dB store.

##### store

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

The name of the store in IndexedDB.

##### item

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

An object representing the current item to update.

##### newOptions

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

The following is the data structure with types for the options:

```ts
interface InterestGroup {
  _expires: typeof number;
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

#### db.store.delete(store, id)

Returns a `Promise`, which resolves to `undefined`, which removes an entry from the Indexed DB

##### store

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

The name of the store in IndexedDB.

##### id

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

A string that represents the key of the entry; should match the `_keyPath`.

### Validation

A set of general utilities to validate functions parameters, object structures, data types, etc.

#### validate.hasRequiredKeys(object, keys)

Searches an object for required keys. Returns `false` if all keys are found, or throws an `Error` if some missing keys are found. 

##### object

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

An object to validate that required keys are present.

##### keys

Type: [`<Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

An array of required keys to validate exist.

#### validate.printInvalidOptionTypes(options, invalid, types)

Provides an array of strings of errors for invalid types for options passed to a function. Returns an array of strings.

##### options

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

An object of options passed to a function.

##### invalid

Type: [`<Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

An array of options that are invalid based on their types.

##### types

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

 An object of options with the keys the same as the `options` and values set to data types.

#### validate.type

Validates data types.  As of this time the supported types are `Array`, `Number`, `Object`, `String`, and `URL`. Returns a boolean.

#### validate.param(param, type)

Validates parameter types passed into functions. Returns an `Error` if the types don't match.

##### param

Type: `*` 

A stringed parameter provided to a function

##### type

Type: [`<String>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)

A string representation of a data structure

#### validate.hasInvalidOptionTypes(options, types)

Checks options passed to a function for the valid data types based on a structure.  Returns `false` if all types are valid, otherwise an `Error`.

##### options

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

An object to validate the types.

##### types

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

A matching object with values set to the data type.
