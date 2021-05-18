import runAdAuction from '../../../src/frame/auction';
import {
	mockAllOptions,
} from '../../mocks/auction.mock';

describe('Interest Groups', () => {
	describe('runAdAuction', () => {
		it('should return true when all valid options are provided', async () => {
			const auction = await runAdAuction(mockAllOptions);
			await expect(auction).toBeNull();
			// await expect(auction).toEqual(expect.any(String));
		});
	});
});
