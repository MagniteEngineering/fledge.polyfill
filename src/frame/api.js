import runAdAuction from './auction/index.js';
import {
	joinAdInterestGroup,
	leaveAdInterestGroup,
} from './interest-groups/index.js';

export default async function fledgeAPI ({ data, ports }) {
	try {
		if (!Array.isArray(data)) {
			throw new Error('data is not what it should be');
		}

		switch (data[0]) {
			case 'joinAdInterestGroup': {
				const [ , request ] = data;
				const [ options, expiry, debug ] = request;

				await joinAdInterestGroup(options, expiry, debug);

				return true;
			}
			case 'leaveAdInterestGroup': {
				const [ , request ] = data;
				const [ group, debug ] = request;

				await leaveAdInterestGroup(group, debug);

				return true;
			}
			case 'runAdAuction': {
				const [ , request ] = data;
				const [ conf, debug ] = request;

				if (ports.length !== 1) {
					throw new Error(`Port transfer mismatch during request: expected 1 port, but received ${ports.length}`);
				}
				const [ port ] = ports;
				const token = await runAdAuction(conf, debug);
				const response = [ true, token ];
				port.postMessage(response);
				port.close();

				return true;
			}
			default: {
				return false;
			}
		}
	} catch (error) {
		const response = [ false ];
		for (const port of ports) {
			port.postMessage(response);
		}
		throw error;
	}
}
