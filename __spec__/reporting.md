# Reporting [§](https://github.com/WICG/turtledove/blob/main/FLEDGE.md#5-event-level-reporting-for-now)

<!-- toc -->
<!-- end:toc -->

## Introduction

Once the winning ad has rendered, the seller and the winning buyer each have an opportunity to perform reporting on the auction outcome. The browser will call one reporting function in the seller's auction worklet and one in the winning buyer's bidding worklet.

## Methods

### `report_result(auction_config<AuctionConfig>, browser_signals<Object>)`

This reporting function that will be provided by the `decision_logic_url`.

#### Option Types

* **`auction_config<AuctionConfig>`**: comes from the auction
* **`browser_signals<Object>`**: this is provided by the browser, but in this case, it will be arbitrary information we provide, explaining to consumers not to rely too heavily on the information provided

#### Validation

All fields are required and provided to the function when called.

* If one of the fields is missing, return with an `Error` stating a generic message such as "missing fields"
* If, at some time we do handle permissions, then in the event there is missing permissions, the return should be an `Error` describing the reason.

#### Return

* If successful, return a `<Object>` of arbitrary information to be passed to the buyers reporting function
* If failure, throw an `Error(<reason>)`

#### Implementation

The implementation details of this function are subject to however the seller decides to process the inputs, at this time.  However, in the future, network calls will be prevented from being run within this context and should not be relied upon as they are subject to change.

There is an [ongoing discussion](https://github.com/MagniteEngineering/fledge.polyfill/discussions/9) about how we might want to expose these functions.  Whatever method is chosen, the return of this function will be sent to the buyers `report_win()` function and so there may need to be some temporary storage mechanism similar to Cross-Domain storage where that value can be read from when being sent to the buyer.

### `report_win(...)`

This reporting function that will be provided by the `bidding_logic_url` from the Interest Group owner.

#### Option Types

* **`auction_signals<AuctionConfig.auction_signals>`**: comes from the auction; specifically the `auction_signals` key from the `AuctionConfig`
* **`per_buyer_signals<AuctionConfig.per_buyer_signals[buyer_domain]>`**: comes from the auction; specifically the `per_buyer` key that would match the domain of the interest group buyer with the same key in the Object
* **`seller_signals<Object>`**: this is provided by the sellers `report_result` function
* **`browser_signals<Object>`**: this is provided by the browser, but in this case, it will be arbitrary information we provide, explaining to consumers not to rely too heavily on the information provided

#### Validation

All fields are required and provided to the function when called.

* If one of the fields is missing, return with an `Error` stating a generic message such as "missing fields"
* If, at some time we do handle permissions, then in the event there is missing permissions, the return should be an `Error` describing the reason.

#### Return

* If successful, return a `true`
* If failure, return `Error(<reason>)`

#### Implementation

The implementation details of this function are subject to however the buyer decides to process the inputs, at this time.  However, in the future, network calls will be prevented from being run within this context and should not be relied upon as they are subject to change.

There is an [ongoing discussion](https://github.com/MagniteEngineering/fledge.polyfill/discussions/9) about how we might want to expose these functions.
