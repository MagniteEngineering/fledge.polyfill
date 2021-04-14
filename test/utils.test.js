import types from '../src/interest-groups/types';
import {
	hasInvalidOptionTypes,
	isMissingRequiredOptions,
	printInvalidOptionTypes,
	validateParam,
	validateType,
} from '../src/utils/';
import { mockAllOptions } from './mocks';

describe('Utilities', () => {
	describe('hasInvalidOptionTypes', () => {
		it('should throw an Error when an invalid option type is provided', () => {
			const mockOptionsInvalidTypes = {
				...mockAllOptions,
				name: 0,
			};
			expect(() => hasInvalidOptionTypes(mockOptionsInvalidTypes, types)).toThrow();
		});

		it('should return false when all options types are valid', () => {
			expect(hasInvalidOptionTypes(mockAllOptions, types)).toBe(false);
		});
	});

	describe('isMissingRequiredOptions', () => {
		it('should throw an Error when a required option type is missing', () => {
			expect(() => isMissingRequiredOptions({ foo: 'bar' }, [ 'mock' ])).toThrow();
		});

		it('should return false when all required options are provided', () => {
			expect(isMissingRequiredOptions({ mock: 'value' }, [ 'mock' ])).toBe(false);
		});
	});

	describe('printInvalidOptionTypes', () => {
		it('should return a string match', () => {
			expect(printInvalidOptionTypes({ mock: 0 }, [ 'mock' ], { mock: 'string' })).toContain(`'mock' requires a type of "string"! A type of number was provided instead.`);
		});
	});

	describe('validateParam', () => {
		it('should throw an Error when an invalid parameter type is provided', () => {
			expect(() => validateParam('mock', 'number')).toThrow();
		});
	});

	describe('validateType', () => {
		describe('array', () => {
			it('should return true when a valid type is provided', () => {
				expect(validateType.array([ 'mock' ])).toBe(true);
			});

			it('should return false when an invalid type is provided', () => {
				expect(validateType.array(undefined)).toBe(false);
				expect(validateType.array(true)).toBe(false);
				expect(validateType.array(0)).toBe(false);
				expect(validateType.array('mock')).toBe(false);
				expect(validateType.array(() => { /* noOp */ })).toBe(false);
				expect(validateType.array(null)).toBe(false);
				expect(validateType.array({})).toBe(false);
			});
		});

		describe('number', () => {
			it('should return true when a valid type is provided', () => {
				expect(validateType.number(0)).toBe(true);
			});

			it('should return false when an invalid type is provided', () => {
				expect(validateType.number(undefined)).toBe(false);
				expect(validateType.number(true)).toBe(false);
				expect(validateType.number('mock')).toBe(false);
				expect(validateType.number(() => { /* noOp */ })).toBe(false);
				expect(validateType.number(null)).toBe(false);
				expect(validateType.number([])).toBe(false);
				expect(validateType.number({})).toBe(false);
			});
		});

		describe('object', () => {
			it('should return true when a valid type is provided', () => {
				expect(validateType.object({ mock: 'value' })).toBe(true);
			});

			it('should return false when an invalid type is provided', () => {
				expect(validateType.object(undefined)).toBe(false);
				expect(validateType.object(true)).toBe(false);
				expect(validateType.object(0)).toBe(false);
				expect(validateType.object('mock')).toBe(false);
				expect(validateType.object(() => { /* noOp */ })).toBe(false);
				expect(validateType.object(null)).toBe(false);
				expect(validateType.object([])).toBe(false);
			});
		});

		describe('string', () => {
			it('should return true when a valid type is provided', () => {
				expect(validateType.string('mock')).toBe(true);
			});

			it('should return false when an invalid type is provided', () => {
				expect(validateType.string(undefined)).toBe(false);
				expect(validateType.string(true)).toBe(false);
				expect(validateType.string(0)).toBe(false);
				expect(validateType.string(() => { /* noOp */ })).toBe(false);
				expect(validateType.string(null)).toBe(false);
				expect(validateType.string([])).toBe(false);
				expect(validateType.string({})).toBe(false);
			});
		});

		describe('url', () => {
			it('should return true when a valid type is provided', () => {
				expect(validateType.url('http://example.com')).toBe(true);
			});

			it('should return false when an invalid type is provided', () => {
				expect(validateType.url(undefined)).toBe(false);
				expect(validateType.url(true)).toBe(false);
				expect(validateType.url(0)).toBe(false);
				expect(validateType.url('mock')).toBe(false);
				expect(validateType.url(() => { /* noOp */ })).toBe(false);
				expect(validateType.url(null)).toBe(false);
				expect(validateType.url([])).toBe(false);
				expect(validateType.url({})).toBe(false);
			});
		});
	});
});
