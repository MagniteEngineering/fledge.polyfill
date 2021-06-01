import { renderFledgeAd } from '../../../src/api/';

describe('renderFledgeAd', () => {
	describe('Errors', () => {
		describe('function parameters', () => {
			it('should throw an Error when no parameters are provided', async () => {
				await expect(() => renderFledgeAd()).rejects.toThrow();
			});

			it('should throw an Error when parameters are not valid String', async () => {
				await expect(() => renderFledgeAd('.selector', undefined)).rejects.toThrow();
				await expect(() => renderFledgeAd(undefined, 'uuid')).rejects.toThrow();
				await expect(() => renderFledgeAd('.selector', true)).rejects.toThrow();
				await expect(() => renderFledgeAd(true, 'uuid')).rejects.toThrow();
				await expect(() => renderFledgeAd('.selector', 0)).rejects.toThrow();
				await expect(() => renderFledgeAd(0, 'uuid')).rejects.toThrow();
				await expect(() => renderFledgeAd('.selector', () => { /* noOp */ })).rejects.toThrow();
				await expect(() => renderFledgeAd(() => { /* noOp */ }, 'uuid')).rejects.toThrow();
				await expect(() => renderFledgeAd('.selector', null)).rejects.toThrow();
				await expect(() => renderFledgeAd(null, 'uuid')).rejects.toThrow();
			});
		});

		describe('DOM manipulation', () => {
			it('should throw an Error when the target is not found', async () => {
				await expect(() => renderFledgeAd('#ad-slot-1', 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3')).rejects.toThrow();
			});

			it('should throw an Error when the token is not found', async () => {
				document.body.innerHTML = '<div id="ad-slot-1"><iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe></div>';
				await expect(() => renderFledgeAd('#ad-slot-1', 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3')).rejects.toThrow();
			});
		});
	});
});
