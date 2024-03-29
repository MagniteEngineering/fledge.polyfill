# fledge.polyfill [![npm version](https://badge.fury.io/js/%40magnite%2Ffledge.polyfill.svg)](https://badge.fury.io/js/%40magnite%2Ffledge.polyfill) [![codecov](https://codecov.io/gh/MagniteEngineering/fledge.polyfill/branch/main/graph/badge.svg?token=8NUU67BFAH)](https://codecov.io/gh/MagniteEngineering/fledge.polyfill)  [![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=the-holocron/threepio)](https://dependabot.com)

A [Fledge](https://github.com/WICG/turtledove/blob/main/FLEDGE.md) JavaScript polyfill.

## Installation

```bash
npm install --save @magnite/fledge.polyfill
```

## Table of Contents

- [Usage](#usage)
- [Documentation](#where-to-find-documentation)
- [Changelog](#how-we-track-changes-)
- [Versioning](#how-we-version-)
- [Contribution](#how-to-contribute-)
- [Support](#where-to-find-suport-)
- [Tools](#tools-we-use)
- [Support](#where-to-find-suport)
- [License](#license-)

## Usage

As of this moment, the polyfill is intended to work within the Chrome browser at a version greater than 91.  There are several ways to invoke the polyfill, but given the modern capabilities of support required, the following is the recommended way to invoke the API.

Even though the examples below point to a `node_modules` directory, you should probably have a build process in place that compiles it to your preferred sites location.

### Interest Groups

```html
<script type="module">
    import Fledge from "./node_modules/@magnite/fledge.polyfill/dist/api/esm/index.js";
    const fledge = new Fledge();

    const options = {
        owner: "www.buyer.com",
        name: "an-interest-group",
        biddingLogicUrl: "https://dsp.com/bidding",
    };

    // join an interest group
    await fledge.joinAdInterestGroup(options, 864000000);

    // leave an interest group
    await fledge.leaveAdInterestGroup(options);
</script>
```

### Auctions

```html
<script type="module">
    import Fledge from "./node_modules/@magnite/fledge.polyfill/dist/api/esm/index.js";
    const fledge = new Fledge();

    const options = {
        seller: "www.seller.com",
        decisionLogicUrl: "https://ssp.com/auction",
        interestGroupBuyers: [
            "www.buyer1.com",
            "www.buyer2.com",
        ],
    };

    const auctionResults = await fledge.runAdAuction(options);
</script>
```

### Render the Ad

In the future, rendering an ad will be handled by the Fledge API and would be passed to a Fenced Frame (which hasn't be established yet).  In the polyfill world, we don't have access to a Fenced Frame and so its required for the consumer of this library to create their own `iframe` and pass the results from the auction to it.  Thankfully, we've created a temporary feature for you to handle this in a way that respects the intention of the proposal by keeping the results opaque in the form of a token that represents the winning ad `renderingUrl`.

```html
<script type="module">
    import Fledge from "./node_modules/@magnite/fledge.polyfill/dist/api/esm/index.js";
    const fledge = new Fledge();

    // ...run the auction; see above for full example
    const auctionResults = await fledge.runAdAuction(options);

    // create an iframe within the Fledge auction iframe, render the winning ad
    const ad = document.createElement('iframe');
    ad.src = auctionResults;
    document.getElementById('ad-slot-1').appendChild(ad);
</script>
```

## Where to Find Documentation

The best way to find out what's available is to dig through source code, but the following is the API documentation.

### API

#### runAdAuction(conf)

Returns `null` if no winning bid is found.  Returns a `Promise` with a token representation of the winning bids rendering URL.

If an invalid option is passed, then an `Error` will be thrown with a reason to help debug.

##### conf

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

The following is the data structure with types for the options:

```ts
interface AuctionOptions {
  seller: typeof string;
  decisionLogicUrl: typeof url;
  interestGroupBuyers: typeof array;
  trustedScoringSignalsUrl?; typeof url;
  additionalBids?: typeof array;
  auctionSignals?: typeof object;
  sellerSignals?: typeof object;
  perBuyerSignals?: typeof object;
}
```

#### joinAdInterestGroup(options, expiry)

Returns `true` and creates an entry in a cross-domain Indexed dB store.

If an invalid option is passed, then an `Error` will be thrown with a reason to help debug.

##### options

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

The following is the data structure with types for the options:

```ts
interface InterestGroup {
  owner: typeof string;
  name: typeof string;
  biddingLogicUrl: typeof url;
  dailyUpdateUrl?: typeof url;
  trustedBiddingSignalsUrl?; typeof url;
  trustedBiddingSignalsKeys?: typeof array;
  userBiddingSignals?: typeof object;
  ads?: typeof array;
}
```

##### expiry

Type: [`<Number>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)

A number of days (set in milliseconds) that the Interest Group will stay active, with a maximum of 30 days (or 2592000000).

#### leaveAdInterestGroup(group)

Returns `true` and removes an entry in a cross-domain Indexed dB store.

If an invalid option is passed, then an `Error` will be thrown with a reason to help debug.

##### options

Type: [`<Object>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

The following is the data structure with types for the options:

```ts
interface InterestGroup {
  owner: typeof string;
  name: typeof string;
  biddingLogicUrl?: typeof url;
  dailyUpdateUrl?: typeof url;
  trustedBiddingSignalsUrl?; typeof url;
  trustedBiddingSignalsKeys?: typeof array;
  userBiddingSignals?: typeof object;
  ads?: typeof array;
}
```

## How We Track Changes [![Keep a Changelog](https://img.shields.io/badge/Keep%20a%20Changelog-1.0.0-orange)](https://keepachangelog.com/en/1.0.0/)

This project uses a CHANGELOG and [GitHub releases](https://help.github.com/en/github/administering-a-repository/about-releases) which contains a curated, chronologically ordered list of notable changes for each version of a project. [Read more about changelogs](https://keepachangelog.com/en/1.0.0/).

## How We Version [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

We use [SemVer](https://semver.org/) for its versioning providing us an opt-in approach to releases. This means we add a version number according to the spec, as you see below. So rather than force developers to consume the latest and greatest, they can choose which version to consume and test any newer ones before upgrading. Please the read the spec as it goes into further detail.

Given a version number **MAJOR.MINOR.PATCH**, increment the:

- **MAJOR** version when you make incompatible API changes.
- **MINOR** version when you add functionality in a backward-compatible manner.
- **PATCH** version when you make backward-compatible bug fixes.

Additional labels for pre-release and build metadata are available as extensions to the **MAJOR.MINOR.PATCH** format.

## How to Contribute [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Have a bug or a feature request? Looking to contribute to advance the project? Read our [contribution guide](./github/CONTRIBUTING.md) or [maintenance guide](./.github/MAINTAINING.md) first in order to understand how we do things around here. Or you could look at some of our other guides below:

<details>
  <summary><strong>How do I…</strong> (click to expand)</summary>

- [Ask or Say Something?](./.github/SUPPORT.md)
    - [Request Support](./.github/SUPPORT.md#request-support)
    - [Report an Error or Bug](./.github/SUPPORT.md#report-an-error-or-bug)
    - [Request a Feature](./.github/SUPPORT.md#request-a-feature)
- [Make Something?](./.github/CONTRIBUTING.md)
    - [Setup the Project](./.github/CONTRIBUTING.md#get-started)
    - [Create an Issue](./.github/CONTRIBUTING.md#creating-a-good-issue)
    - [Create a Feature Request](./.github/CONTRIBUTING.md#create-a-good-feature-request)
    - [Contribute Documentation](./.github/CONTRIBUTING.md#contribute-to-documentation)
    - [Contribute Code](./.github/CONTRIBUTING.md#create-a-pull-request)
    - [Join the Team](./.github/CONTRIBUTING.md#join-the-team)
- [Manage Something](./.github/MAINTAINING.md)
    - [Provide Support on Issues](./.github/MAINTAINING.md#provide-support-on-issues)
    - [Label Issues](./.github/MAINTAINING.md#label-issues)
    - [Clean Up Issues and PRs](./.github/MAINTAINING.md#clean-up-issues-and-prs)
    - [Create a Pull Request](./.github/MAINTAINING.md#create-a-pull-request)
    - [Review Pull Requests](./.github/MAINTAINING.md#review-pull-requests)
    - [Merge Pull Requests](./.github/MAINTAINING.md#merge-pull-requests)
    - [Tag a Release](./.github/MAINTAINING.md#tag-a-release)
    - [Release a Version](./.github/MAINTAINING.md#release-a-version)

</details>

## Where to Find Support [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](code_of_conduct.md)

Looking to talk to someone or need some help? Please read our [support guidelines](./.github/SUPPORT.md).

## Tools We Use

- [CommitLint](https://commitlint.js.org/#/) - Used to ensure our commits follow our standards
- [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog) - Used to generate our CHANGELOG
- [ESLint](https://eslint.org/) - Used to lint our JavaScript
- [Husky](https://github.com/typicode/husky) - Used for auto-fixing linting errors on each commit
- [Jest](https://jestjs.io/) - Used for testing our JavaScript and (S)CSS
- [Semantic Release](https://semantic-release.gitbook.io/semantic-release/) - Used for automating and releasing our library

## References

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) - For how we format commit messages
- [Contributor Convenant](https://www.contributor-covenant.org)
- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) - For building out a quality CHANGELOG
- [Make a README](https://www.makeareadme.com/) - For building out this README
- [SemVer](https://semver.org/) - For versioning this library

## License [![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)

©2021 Magnite, Inc. See [LICENSE](./LICENSE) for specifics.
