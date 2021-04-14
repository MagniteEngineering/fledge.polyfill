import { default as fledge } from '../src/';
import {
	mockAllOptions,
	mockOptionals,
} from './mocks';

describe('Interest Groups', () => {
	describe('leaveAdInterestGroup', () => {
		describe('Errors', () => {
			describe('function parameters', () => {
				it('should throw an Error when no options are provided', () => {
					expect(() => fledge.leaveAdInterestGroup()).toThrow();
				});

				describe('required option parameters', () => {
					it('should throw an Error when no required options are provided', () => {
						expect(() => fledge.leaveAdInterestGroup({})).toThrow();
						expect(() => fledge.leaveAdInterestGroup(mockOptionals)).toThrow();
					});
				});

				describe('data structures', () => {
					it('should throw an Error when options is not a valid Object', () => {
						expect(() => fledge.leaveAdInterestGroup(undefined)).toThrow();
						expect(() => fledge.leaveAdInterestGroup(true)).toThrow();
						expect(() => fledge.leaveAdInterestGroup(0)).toThrow();
						expect(() => fledge.leaveAdInterestGroup('mock')).toThrow();
						expect(() => fledge.leaveAdInterestGroup(() => { /* noOp */ })).toThrow();
						expect(() => fledge.leaveAdInterestGroup(null)).toThrow();
					});

					it("should throw an Error when 'owner' is not a valid String", () => {
						const mockOptionsInvalidOwner = {
							...mockAllOptions,
							owner: 0,
						};
						expect(() => fledge.leaveAdInterestGroup(mockOptionsInvalidOwner)).toThrow();
					});

					it("should throw an Error when 'name' is not a valid String", () => {
						const mockOptionsInvalidName = {
							...mockAllOptions,
							name: 0,
						};
						expect(() => fledge.leaveAdInterestGroup(mockOptionsInvalidName)).toThrow();
					});
				});
			});
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', () => {
				expect(fledge.leaveAdInterestGroup(mockAllOptions)).toBe(true);
			});
		});
	});
});
