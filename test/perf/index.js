const joinIgTest = require('./join-ig');
const auctionTest = require('./run-auction');

(async () => {
	await joinIgTest();
	await auctionTest();
})();
