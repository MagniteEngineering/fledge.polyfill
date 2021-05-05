/* eslint-disable camelcase, no-cond-assign */
import { echo } from '../../utils/index.js';

/*
 * @function
 * @name getTarget
 * @description grab a DOM node based on a CSS style selector passed in
 * @author Newton <cnewton@magnite.com>
 * @param {string} selector - a CSS style selector
 * @throws {Error} if no target is found based on the selector provided
 * @return {DOM Node} a DOM node found on the page
 */
export const getTarget = selector => document.querySelector(selector);

/*
 * @function
 * @name hasRendered
 * @description determine if a DOM element is visibile on a page
 * @param {DOM element} el - a list of bidders (also referred to as interest groups)
 * @return {boolean} whether or not an element is visible on the screen
 */
export const hasRendered = el => {
	if (!(el instanceof Element)) { throw Error(`${el} is not a DOM element.`); }

	// check that the element is not hidden by CSS styles
	const { display, opacity, visibility } = getComputedStyle(el);
	if (display === 'none') { return false; }
	if (visibility !== 'visible') { return false; }
	if (opacity < 0.1) { return false; }

	// check that the element is not positioned off the page
	const { left, height, top, width } = el.getBoundingClientRect();
	const { offsetHeight } = el;
	const { offsetWidth } = el;
	if (offsetWidth + offsetHeight + height + width === 0) { return false; }

	// check that the element is not absolutely positioned off the page
	const x = left + offsetWidth / 2;
	if (x < 0) { return false; }
	if (x > (document.documentElement.clientWidth || window.innerWidth)) { return false; }
	const y = top + offsetHeight / 2;
	if (y < 0) { return false; }
	if (y > (document.documentElement.clientHeight || window.innerHeight)) { return false; }

	let pointContainer = document.elementFromPoint(x, y);
	do {
		if (pointContainer === el) { return true; }
	} while (pointContainer = pointContainer.parentNode);

	return false;
};

/*
 * @function
 * @name getSellerReport
 * @description given the results of an auction, grab the report from the seller
 * @author Newton <cnewton@magnite.com>
 * @param {object} conf - an auction configuration object
 * @param {object} results - the results of the auction
 * @return {object} an object of data to pass back to the buyers report
 */
export const getSellerReport = async (conf, results) => {
	const { report_result } = await import(conf.decision_logic_url);

	// check if there is even a function
	if (!report_result || typeof report_result !== 'function') {
		return null;
	}

	// generate a report by providing all of the necessary information
	try {
		return report_result(conf, {
			top_window_hostname: window.top.location.hostname,
			interest_group_owner: results.bid.owner,
			interest_group_name: results.bid.name,
			render_url: results.bid.render,
			bid: results.bid.bid,
		});
	} catch (err) {
		echo.error(err);
		return null;
	}
};

/*
 * @function
 * @name getBuyerReport
 * @description given the results of an auction, grab the report from the buyer
 * @author Newton <cnewton@magnite.com>
 * @param {object} conf - an auction configuration object
 * @param {object} results - the results of the auction
 * @param {object} report - the report object from the sellers report
 * @return {void} has a side effect of generating a report for the buyer
 */
export const getBuyerReport = async (conf, results, report) => {
	const { report_win } = await import(results.bid.bidding_logic_url);

	// check if there is even a function
	if (!report_win || typeof report_win !== 'function') {
		return null;
	}

	// generate a report by providing all of the necessary information
	try {
		return report_win(conf?.auction_signals, conf?.per_buyer_signals?.[results.bid.owner], report, {
			top_window_hostname: window.top.location.hostname,
			interest_group_owner: results.bid.owner,
			interest_group_name: results.bid.name,
			render_url: results.bid.render,
			bid: results.bid.bid,
		});
	} catch (err) {
		echo.error(err);
		return null;
	}
};
