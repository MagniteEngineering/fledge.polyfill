import runAdAuction from './auction';
import {
	joinAdInterestGroup,
	leaveAdInterestGroup,
} from './interest-group';

export default async function fledgeAPI ({ data, ports }) {
	try {
		if (!Array.isArray(data)) {
			throw new Error(`The API expects the data to be in the form of an array, with index 0 set to the action, and index 1 set to the data.  A ${typeof data} was passed instead.`);
		}

		switch (data[0]) {
			case 'joinAdInterestGroup': {
				const [ , request ] = data;
				const [ options, expiry ] = request;

				await joinAdInterestGroup(options, expiry);

				return true;
			}
			case 'leaveAdInterestGroup': {
				const [ , request ] = data;
				const [ group ] = request;

				await leaveAdInterestGroup(group);

				return true;
			}
			case 'runAdAuction': {
				const [ , request ] = data;
				const [ conf ] = request;

				if (ports.length !== 1) {
					throw new Error(`Port transfer mismatch during request: expected 1 port, but received ${ports.length}`);
				}
				const [ port ] = ports;
				const token = await runAdAuction(conf);
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
