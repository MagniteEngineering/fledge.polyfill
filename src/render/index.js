import validate from '../utils/validation.js';

/*
 * @function
 * @name renderAd
 * @description render an ad
 * @author Newton <cnewton@magnite.com>
 * @param {string} id - a string reprensenting a valid HTML ID
 * @param {string} token - a string that represents the results from an auction run via the `fledge.runAdAuction` call.
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {Promise<null | true>}
 *
 * @example
 *   renderAd('ad-slot-1', '76941e71-2ed7-416d-9c55-36d07beff786');
 */
export default async function renderAd (id, token) {
	validate.param(id, 'string');
	validate.param(token, 'string');

	return true;
}
