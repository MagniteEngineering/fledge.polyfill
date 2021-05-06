/* eslint-disable compat/compat */
import { InterestGroup } from '../../src/api/types';
import { frame, validate } from '../../src/api/utils';
import { mockAllOptions } from './interest-groups.mock';

describe('Utils', () => {
	describe('frame', () => {
		describe('create', () => {
			it('should render an iframe', () => {
				// Set up our document body
				document.body.innerHTML = '<div id="ad-slot-1"></div>';
				const target = document.querySelector('#ad-slot-1');
				frame.create({
					props: { id: 'mock' },
					source: 'http://example.com',
					target,
				});
				expect(target.innerHTML).toEqual('<iframe src="http://example.com/" scrolling="no" id="mock" style="border-width: 0px;"></iframe>');
				expect(target.id).toEqual('ad-slot-1');
			});
		});
	});

	describe('Validation', () => {
		describe('hasInvalidOptionTypes', () => {
			it('should throw an Error when an invalid option type is provided', () => {
				const mockOptionsInvalidTypes = {
					...mockAllOptions,
					name: 0,
				};
				expect(() => validate.hasInvalidOptionTypes(mockOptionsInvalidTypes, InterestGroup)).toThrow();
			});

			it('should return false when all options types are valid', () => {
				expect(validate.hasInvalidOptionTypes(mockAllOptions, InterestGroup)).toBe(false);
			});
		});

		describe('hasRequiredKeys', () => {
			it('should throw an Error when a required option type is missing', () => {
				expect(() => validate.hasRequiredKeys({ foo: 'bar' }, [ 'mock' ])).toThrow();
			});

			it('should return false when all required options are provided', () => {
				expect(validate.hasRequiredKeys({ mock: 'value' }, [ 'mock' ])).toBe(false);
			});
		});

		describe('printInvalidOptionTypes', () => {
			it('should return a string match', () => {
				expect(validate.printInvalidOptionTypes({ mock: 0 }, [ 'mock' ], { mock: 'string' })).toContain(`'mock' requires a type of "string"! A type of number was provided instead.`);
			});
		});

		describe('param', () => {
			it('should throw an Error when an invalid parameter type is provided', () => {
				expect(() => validate.param('mock', 'number')).toThrow();
			});
		});

		describe('validate.type', () => {
			describe('array', () => {
				it('should return true when a valid type is provided', () => {
					expect(validate.type.array([ 'mock' ])).toBe(true);
				});

				it('should return false when an invalid type is provided', () => {
					expect(validate.type.array(undefined)).toBe(false);
					expect(validate.type.array(true)).toBe(false);
					expect(validate.type.array(0)).toBe(false);
					expect(validate.type.array('mock')).toBe(false);
					expect(validate.type.array(() => { /* noOp */ })).toBe(false);
					expect(validate.type.array(null)).toBe(false);
					expect(validate.type.array({})).toBe(false);
				});
			});

			describe('number', () => {
				it('should return true when a valid type is provided', () => {
					expect(validate.type.number(0)).toBe(true);
				});

				it('should return false when an invalid type is provided', () => {
					expect(validate.type.number(undefined)).toBe(false);
					expect(validate.type.number(true)).toBe(false);
					expect(validate.type.number('mock')).toBe(false);
					expect(validate.type.number(() => { /* noOp */ })).toBe(false);
					expect(validate.type.number(null)).toBe(false);
					expect(validate.type.number([])).toBe(false);
					expect(validate.type.number({})).toBe(false);
				});
			});

			describe('object', () => {
				it('should return true when a valid type is provided', () => {
					expect(validate.type.object({ mock: 'value' })).toBe(true);
				});

				it('should return false when an invalid type is provided', () => {
					expect(validate.type.object(undefined)).toBe(false);
					expect(validate.type.object(true)).toBe(false);
					expect(validate.type.object(0)).toBe(false);
					expect(validate.type.object('mock')).toBe(false);
					expect(validate.type.object(() => { /* noOp */ })).toBe(false);
					expect(validate.type.object(null)).toBe(false);
					expect(validate.type.object([])).toBe(false);
				});
			});

			describe('string', () => {
				it('should return true when a valid type is provided', () => {
					expect(validate.type.string('mock')).toBe(true);
				});

				it('should return false when an invalid type is provided', () => {
					expect(validate.type.string(undefined)).toBe(false);
					expect(validate.type.string(true)).toBe(false);
					expect(validate.type.string(0)).toBe(false);
					expect(validate.type.string(() => { /* noOp */ })).toBe(false);
					expect(validate.type.string(null)).toBe(false);
					expect(validate.type.string([])).toBe(false);
					expect(validate.type.string({})).toBe(false);
				});
			});

			describe('url', () => {
				it('should return true when a valid type is provided', () => {
					expect(validate.type.url('http://example.com')).toBe(true);
				});

				it('should return false when an invalid type is provided', () => {
					expect(validate.type.url(undefined)).toBe(false);
					expect(validate.type.url(true)).toBe(false);
					expect(validate.type.url(0)).toBe(false);
					expect(validate.type.url('mock')).toBe(false);
					expect(validate.type.url(() => { /* noOp */ })).toBe(false);
					expect(validate.type.url(null)).toBe(false);
					expect(validate.type.url([])).toBe(false);
					expect(validate.type.url({})).toBe(false);
				});
			});
		});
	});
});
