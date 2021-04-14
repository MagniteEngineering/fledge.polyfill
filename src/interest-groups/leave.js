import {
	hasInvalidOptionTypes,
	isMissingRequiredOptions,
	validateParam,
} from '../utils/';
import types from './types';

export default function leaveAdInterestGroup (group) {
	validateParam(group, 'object');
	isMissingRequiredOptions(group, [ 'owner', 'name' ]);
	hasInvalidOptionTypes(group, types);

	return true;
}
