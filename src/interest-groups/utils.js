import {
	validateParam,
} from '../utils/';

export const getInterestGroup = (owner, name) => {
	validateParam(owner, 'string');
	validateParam(name, 'string');
};
