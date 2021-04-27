import echo from '../utils/console.js';
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
export default async function renderAd (selector, token, debug = false) {
	debug && echo.group('Fledge: Render an Ad');
	debug && echo.log('ad render selector:', selector);
	debug && echo.log('ad render token:', token);
	validate.param(selector, 'string');
	validate.param(token, 'string');

	debug && echo.info('checking that target exists on the page');
	const target = getTarget(selector);
	debug && echo.log('target:', target);
	if (!target) {
		throw new Error(`Target not found on the page! Please check that ${target} exists on the page.`);
	}

	debug && echo.info('checking that winning token exists');
	const winner = await db.store.get(AUCTION_STORE, token);
	debug && echo.log('winners token:', winner);
	if (!(winner && winner.id === token)) {
		throw new Error(`A token was not found! Token provided: ${token}`);
	}

	debug && echo.info('checking that winner to be rendered is on the same hostname as the auction');
	if (winner?.hostname !== window.top.location.hostname) {
		debug && echo.error(`Attempting to render the winner on a location that doesn't match the auctions hostname`, { winner: winner.hostname, auction: window.top.location.hostname });
		throw new Error('Something went wrong! No ad was rendered.');
	}
	debug && echo.info('rendering an iframe with the winning ad');
	renderFrame(target, winner);

	debug && echo.info('checking that ad iframe actually rendered');
	const ad = getTarget(`#fledge-auction-${token}`);
	debug && echo.log('ads target:', ad);
	if (!ad) {
		throw new Error('Something went wrong! No ad was rendered.');
	}
	debug && echo.groupEnd();

	return true;
}
