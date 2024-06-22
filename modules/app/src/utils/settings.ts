export type Settings = {
	networks: Settings.Network[];
	ipfs: Settings.Ipfs;
};

export namespace Settings {
	export type Network = {
		name: string;
		chainId: bigint;
		providers: [string, ...string[]];
		subgraph: string;
		contracts: {
			EternisPost: string;
			EternisTipPost: string;
		};
	};

	export type Ipfs = {
		gateways: Record<string, string>;
	};
}

// TODO: Finish this, also make a user interface for it, so users can add their own networks and gateways, and stuff
// Example, something like this:
// Don't forget, networks are not changed. we only need user to connect their wallet when they wanna post something.
// While positing they also choose the network they wanna post to.
// So whole app doesnt have a thing called "current network".
// We are multi-chain anyway, so we don't need to have a "current network".
// Use all gateways and race them for every request.
// If we are expecting a video, gateway should respond with 206 Partial Content. so it shouldnt download the whole video.
// Just pick the one that gives 206 Partial Content first.
const settings = {
	networks: [
		{
			name: "Sepolia",
			chainId: 123n,
			providers: ["https://rpc-sepolia.dforum.network"],
			subgraph: "https://api.studio.thegraph.com/query/45351/dforum-sepolia/dev-1705864167904",
			contracts: {
				EternisPost: "0x23446DdCe60FB29B0265412eCB60B5feB76058CD",
				EternisTipPost: "0x23446DdCe60FB29B0265412eCB60B5feB76058CD",
			},
		},
	],
	ipfs: {
		gateways: {
			local_default: "http://localhost:8080",
			local_brave: "http://localhost:48080",
			ipfs_io: "https://ipfs.io",
			infura: "https://ipfs.infura.io",
			w3s: "https://w3s.link",
			dweb: "https://dweb.link",
			cloudflare: "https://cloudflare-ipfs.com",
			storj: "https://demo.storj-ipfs.com",
		},
	},
} as const satisfies Settings;

/* 
ok also you can use this trick while racing gateways:

const response = await fetch(..., {
	method: 'HEAD', // only get the headers
    headers: {
        'Range': 'bytes=0-999999999' // force the gateway to include Content-Length header, so we can check file size without downloading the whole file
    }
})

so you dont need to download the whole file to check if the gateway can find it or not.
*/
