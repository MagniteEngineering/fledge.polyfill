import { fledge } from '../../src/';
import {
	mockAllOptions,
	mockOptionals,
} from './mocks';

describe('Interest Groups', () => {
	describe('leaveAdInterestGroup', () => {
		describe('Errors', () => {
			describe('function parameters', () => {
				it('should throw an Error when no options are provided', async () => {
					await expect(() => fledge.leaveAdInterestGroup()).rejects.toThrow();
				});

				describe('required option parameters', () => {
					it('should throw an Error when no required options are provided', async () => {
						await expect(() => fledge.leaveAdInterestGroup({})).rejects.toThrow();
						await expect(() => fledge.leaveAdInterestGroup(mockOptionals)).rejects.toThrow();
					});
				});

				describe('data structures', () => {
					it('should throw an Error when options is not a valid Object', async () => {
						await expect(() => fledge.leaveAdInterestGroup(undefined)).rejects.toThrow();
						await expect(() => fledge.leaveAdInterestGroup(true)).rejects.toThrow();
						await expect(() => fledge.leaveAdInterestGroup(0)).rejects.toThrow();
						await expect(() => fledge.leaveAdInterestGroup('mock')).rejects.toThrow();
						await expect(() => fledge.leaveAdInterestGroup(() => { /* noOp */ })).rejects.toThrow();
						await expect(() => fledge.leaveAdInterestGroup(null)).rejects.toThrow();
					});

					it("should throw an Error when 'owner' is not a valid String", async () => {
						const mockOptionsInvalidOwner = {
							...mockAllOptions,
							owner: 0,
						};
						await expect(() => fledge.leaveAdInterestGroup(mockOptionsInvalidOwner)).rejects.toThrow();
					});

					it("should throw an Error when 'name' is not a valid String", async () => {
						const mockOptionsInvalidName = {
							...mockAllOptions,
							name: 0,
						};
						await expect(() => fledge.leaveAdInterestGroup(mockOptionsInvalidName)).rejects.toThrow();
					});
				});
			});
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', async () => {
				const ig = await fledge.leaveAdInterestGroup(mockAllOptions);
				await expect(ig).toBe(true);
			});
		});
	});
});
