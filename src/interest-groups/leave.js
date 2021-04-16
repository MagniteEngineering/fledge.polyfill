import {
	hasInvalidOptionTypes,
	isMissingRequiredOptions,
	validateParam,
} from '../utils/index.js';
import db from '../utils/db.js';
import types from './types.js';

/*
 * @function
 * @name leaveAdInterestGroup
 * @description leave an interest group removing from IndexedDB
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options to create an interest group {@link types}
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {true}
 *
 * @example
 *   leaveAdInterestGroup({ owner: 'foo', name: 'bar', bidding_logic_url: 'http://example.com/bid' });
 */
export default async function leaveAdInterestGroup (group) {
	validateParam(group, 'object');
	isMissingRequiredOptions(group, [ 'owner', 'name' ]);
	hasInvalidOptionTypes(group, types);

	console.info('deleting an existing interest group');
	await db.delete(group);

	return true;
}
