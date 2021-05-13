import { joinAdInterestGroup, leaveAdInterestGroup } from '../../../src/frame/interest-group';
import {
	mockAllOptions,
	mockExpiry,
} from '../../mocks/interest-groups.mock';

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
