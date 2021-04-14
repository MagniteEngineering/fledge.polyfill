import leaveAdInterestGroup from './leave';
import {
	mockAllOptions,
} from './mock';

describe('Interest Groups', () => {
	describe('leaveAdInterestGroup', () => {
		describe('Errors', () => {
			describe('function parameters', () => {
				it('should throw an Error when no options are provided', () => {
					expect(() => leaveAdInterestGroup()).toThrow();
				});

				describe('required option parameters', () => {
					it('should throw an Error when no required options are provided', () => {
						expect(() => leaveAdInterestGroup({})).toThrow();
						expect(() => leaveAdInterestGroup(mockAllOptions)).toThrow();
					});

					it("should throw an Error when no 'owner' is provided", () => {
						const mockOptionsOwner = mockAllOptions;
						delete mockOptionsOwner.owner;
						expect(() => leaveAdInterestGroup(mockOptionsOwner)).toThrow();
					});

					it("should throw an Error when no 'name' is provided", () => {
						const mockOptionsName = mockAllOptions;
						delete mockOptionsName.name;
						expect(() => leaveAdInterestGroup(mockOptionsName)).toThrow();
					});
				});

				describe('data structures', () => {
					it('should throw an Error when options is not a valid Object', () => {
						expect(() => leaveAdInterestGroup(undefined)).toThrow();
						expect(() => leaveAdInterestGroup(true)).toThrow();
						expect(() => leaveAdInterestGroup(0)).toThrow();
						expect(() => leaveAdInterestGroup('mock')).toThrow();
						expect(() => leaveAdInterestGroup(() => { /* noOp */ })).toThrow();
						expect(() => leaveAdInterestGroup(null)).toThrow();
					});

					it("should throw an Error when 'owner' is not a valid String", () => {
						const mockOptionsInvalidOwner = {
							...mockAllOptions,
							owner: 0,
						};
						expect(() => leaveAdInterestGroup(mockOptionsInvalidOwner)).toThrow();
					});

					it("should throw an Error when 'name' is not a valid String", () => {
						const mockOptionsInvalidName = {
							...mockAllOptions,
							name: 0,
						};
						expect(() => leaveAdInterestGroup(mockOptionsInvalidName)).toThrow();
					});
				});
			});
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', () => {
				expect(leaveAdInterestGroup(mockAllOptions)).toBe(true);
			});
		});
	});
});
