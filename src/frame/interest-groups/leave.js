import { db, echo, validate } from '../../utils/index.js';
import { IG_STORE } from '../../utils/db.js';
import types from './types.js';
import {
	getIGKey,
} from './utils.js';

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
export default async function leaveAdInterestGroup (group, debug = false) {
	debug && echo.group('Fledge: Leave an Interest Group');
	debug && echo.log('interest group:', group);
	validate.param(group, 'object');
	validate.hasRequiredKeys(group, [ 'owner', 'name' ]);
	validate.hasInvalidOptionTypes(group, types);

	debug && echo.info('deleting an existing interest group');
	await db.store.delete(IG_STORE, getIGKey(group.owner, group.name));
	debug && echo.log('interest group deleted');
	debug && echo.groupEnd();

	return true;
}
