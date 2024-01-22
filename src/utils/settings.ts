export type Settings = {
	networks: Settings.Network[]
	ipfs: Settings.Ipfs
}

export namespace Settings {
	export type Network = {
		name: string
		chainId: bigint
		providers: [string, ...string[]]
		subgraph: string
		contracts: {
			EternisPost: string
			EternisTipPost: string
		}
	}

	export type Ipfs = {
		gateways: [string, ...string[]]
	}
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
			subgraph:
				"https://api.studio.thegraph.com/query/45351/dforum-sepolia/dev-1705864167904",
			contracts: {
				EternisPost: "0x23446DdCe60FB29B0265412eCB60B5feB76058CD",
				EternisTipPost: "0x23446DdCe60FB29B0265412eCB60B5feB76058CD",
			},
		},
	],
	ipfs: {
		gateways: [
			"https://ipfs.io",
			"https://cloudflare-ipfs.com",
			"https://ipfs.infura.io",
			"https://nft.storage",
			"https://ipfs.fleek.co",
			"https://ipfs.jimpick.com",
			"https://ipfs.dweb.link",
			"http://localhost:8080", // Local IPFS gateway
			"http://localhost:48080", // Local Brave IPFS gateway
		],
	},
} as const satisfies Settings

/* 
ok also you can use this trick while racing gateways:

const response = await fetch(..., {
    headers: {
        'Range': 'bytes=0-1'
    }
})

so you dont need to download the whole file to check if the gateway can find it or not.
*/
