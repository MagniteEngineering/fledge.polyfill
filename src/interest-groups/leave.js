import {
	hasInvalidOptionTypes,
	isMissingRequiredOptions,
	validateParam,
} from '../utils/index.js';
import types from './types.js';

export default function leaveAdInterestGroup (group) {
	validateParam(group, 'object');
	isMissingRequiredOptions(group, [ 'owner', 'name' ]);
	hasInvalidOptionTypes(group, types);

	return true;
}
