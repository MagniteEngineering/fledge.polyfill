# Auctions [§](https://github.com/WICG/turtledove/blob/main/FLEDGE.md#2-sellers-run-on-device-auctions)

<!-- toc -->
<!-- end:toc -->

## Introduction

An auction done entirely within a browser worklet with no network access, which allow sellers to decide the buyers, which bids from interest groups are eligible, the logic to determine the winning bid and reporting the outcome.

## How will they be stored?

The same mechanism being created for storing Interest Groups will be used to process the auction, including the scoring of all ads/bids that are sent into the auction by buyers.  [See the current discussion on storage types]((https://github.com/MagniteEngineering/fledge.polyfill/discussions/7).

### Model

The following is the storage model and will be later referred in the document as `AuctionConfig` when referring to its data structure:

```json
"<options.seller>": {
  "<`${window.top.location.origin}${window.top.location.pathname}`>": {
    "<adslot_id>": {
      "seller": "<options.seller>",
      "decision_logic_url": "<options.decision_logic_url>",
      "interest_group_buyers": "<options.interest_group_buyers.keys()>",
      "additional_bids": "<options.additional_bids>"
      "auction_signals": "<options.auction_signals>",
      "seller_signals": "<options.seller_signals>",
      "per_buyer_signals": "<options.per_buyer_signals>"
    }
  }
}
```

### Types

The following is the data types when referring a function that accepts an `<AuctionConfig>` as a parameter.

Any type that is suffixed with a `?` is meant to signify that its an optional parameter when creating an interest group.

* **seller**: _String<URL\>_ (e.g. `"www.dsp.com"`)
* **decision_logic_url**: _String<URL\>_ (e.g. `"dsp.com/nike/bid.js"`)
* **interest_group_buyers**: _Array<URL > | *_ (e.g. `[ "www.tradedesk.com", "nike.com" ]`)
* **additional_bids?**: _Array_
* **auction_signals?**: _Object_
* **seller_signals?**: _Object_
* **per_buyer_signals?**: _Object_

#### Assumptions

?

## Methods

### `runAdAuction(config<AuctionConfig>)`

When a "user" lands on a "seller's" page, this API method will allow them run an auction.  The method accepts one parameter, an configuration `Object` that is of the type [`<AuctionConfig>`](#types).

#### Auction Flow Diagram

![Auction flow diagram](./auction-flow.png)

#### Validation

1. If no `<AuctionConfig>` is passed in, return with an `Error` stating a generic message such as "missing fields"
2. If required fields are missing from `<AuctionConfig>`, return with an `Error` stating a generic message such as "missing fields"
3. If, at some time we do handle permissions, then in the event there is missing permissions, the return should be an `Error` describing the reason.

#### return

* If successful and contains a winning bid, return a `<Promise>`.  While the proposal with maintain this is `opaque`, within our trials we won't support that feature as we won't have any way to do so.
* If successful and does not contain a winning bid, return a `null`
* If failure, return `Error(<reason>)`

#### Implementation

Using the [flow diagram](#auction-flow-diagram) as a guide, the following internal functions will be created in order to support joining an interest group:

1. [InterestGroups.getInterestGroup](#_getinterestgroup28owner26ltstring26gt-name26ltstring26gt2)
2. [_generateBid](#)
3. [_scoreBid](#)
4. [_sortBids](#)

## `decision_logic_url`

This is a URL string that is provided in the [`<AuctionConfig>` options `Object`](#types) when running an auction.  This URL should expose two functions that the seller will need to provide that handle the scoring of ads at auction time (`score_ad()`) as well as report the win (`report_result()`) to the appropriate APIs for accounting purposes.  As of right now, there is no information on how these functions need to be exposed, but one can suspect that it will be either an ES Module or windowed object/class that exposes the two functions.

An example: `"ssp.com/espn/auction.js"`

### `score_ad()`

_Note: `report_result()` and are detailed in other specifications._

## Internal Functions

Detailed are the internal functions and their parameters that will be called at various stages of the two aforementioned API methods.

### `_getFromStorage(type<String>)`

This function is designed to retrieve a set of data from the Cross-Domain storage system (e.g. InterestGroups, Bids, etc.).

* **Private/Public**: Private
* **Return**: If successful and a record exists, return `Object<InterestGroup>`; If no record found, return `null`.

### `_filterInterestGroupBuyers(auctionConfig<AuctionConfig>)`

This function takes in an auction configuration `Object` and filters out the `interest_group_buyers` key, stored as an `Array<String>`, in order to process the eligible interest groups. If wild card `String` in the form of `*` is passed instead, then all interest groups will be eligible to bid.

* **Private/Public**: Private
* **Return**: If successful, return `Array<InterestGroup>`; If no record found, return `null`.

### `_filterBidsByScore(bids<[Bid]>)`

This function is designed to take all bids and filter out any record that has a score of less than or equal to 0.

* **Private/Public**: Private
* **Return**: If successful, return `Array<Bid>`; If failure, throw an `Error` with a message.

### `_sortBidsByScore(bids<[Bid]>)`

This function is designed to take all bids and sort each record by the highest to lowest score.

* **Private/Public**: Private
* **Return**: If successful, return a sorted `Array<Bid>`. If failure, throw an `Error` with a message.

### `_getWinningBid(bids<[Bid]>)`

This function is designed to retrieve the "winning bid".  At the time that is meant to mean the bid with the highest score, but over time this may mean the bid with the highest score that meets other criteria.

* **Private/Public**: Private
* **Return**: If successful and a record exists, return a single `<Bid>`; If no record found, return `null`.

## Open Questions

* [Storage Limits](https://github.com/MagniteEngineering/fledge.polyfill/discussions/6)
