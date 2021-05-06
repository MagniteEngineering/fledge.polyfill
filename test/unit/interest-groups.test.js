import { joinAdInterestGroup, leaveAdInterestGroup } from '../../src/frame/interest-groups/';
import {
	mockAllOptions,
	mockExpiry,
} from './interest-groups.mock';

describe('Interest Groups', () => {
	describe('joinAdInterestGroup', () => {
		it('should return true when all valid options are provided', async () => {
			const ig = await joinAdInterestGroup(mockAllOptions, mockExpiry);
			await expect(ig).toBe(true);
		});
	});

	describe('leaveAdInterestGroup', () => {
		it('should return true when all valid options are provided', async () => {
			const ig = await leaveAdInterestGroup(mockAllOptions);
			await expect(ig).toBe(true);
		});
	});
});
