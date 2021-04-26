import db, { AUCTION_STORE } from '../utils/db.js';
import validate from '../utils/validation.js';
import {
	getTarget,
	renderFrame,
} from './utils.js';

/*
 * @function
 * @name renderAd
 * @description render an ad
 * @author Newton <cnewton@magnite.com>
 * @param {string} selector - a string reprensenting a valid selector to find an element on the page
 * @param {string} token - a string that represents the results from an auction run via the `fledge.runAdAuction` call
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {Promise<null | true>}
 *
 * @example
 *   renderAd('#ad-slot-1', '76941e71-2ed7-416d-9c55-36d07beff786');
 */
export default async function renderAd (selector, token) {
	validate.param(selector, 'string');
	validate.param(token, 'string');

	// console.info('checking that target exists on the page');
	const target = getTarget(selector);
	if (!target) {
		throw new Error(`Target not found on the page! Please check that ${target} exists on the page.`);
	}

	// console.info('checking that winning token exists');
	const winner = await db.store.get(AUCTION_STORE, token);
	if (!(winner && winner.id === token)) {
		throw new Error(`A token was not found! Token provided: ${token}`);
	}

	// console.info('rendering an iframe with the winning ad');
	renderFrame(target, winner);

	// console.info('checking that ad iframe actually rendered');
	const ad = getTarget(`#fledge-auction-${token}`);
	if (!ad) {
		throw new Error('Something went wrong! No ad was rendered.');
	}

	return true;
}
