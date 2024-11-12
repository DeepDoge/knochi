import { tags } from "@purifyjs/core";
import { FeedScroller } from "~/app/feed/FeedScroller";
import { Feed } from "~/features/feed/lib/Feed";
import { Config, config } from "~/shared/config";
import { Address } from "~/shared/solidity/primatives";

const { div } = tags;

export function FeedPage(params: {
	chainId?: Config.Network.ChainId;
	indexerAddress?: Address;
	feedId: Feed.Id;
}) {
	type IndexerEntry = readonly [Config.Network.ChainId, { address: Address }];

	const knownIndexerEntries: readonly IndexerEntry[] = Object.values(config.val.networks).map(
		(network) => [network.chainId, { address: network.contracts.PostIndexer }] as const,
	);

	if (!params.chainId) {
		return render(knownIndexerEntries);
	}

	if (!params.indexerAddress) {
		const network = config.val.networks[`${params.chainId}`];
		if (!network) {
			return render(knownIndexerEntries);
		}

		return render([
			...knownIndexerEntries,
			[network.chainId, { address: network.contracts.PostIndexer }],
		]);
	}

	return render([...knownIndexerEntries, [params.chainId, { address: params.indexerAddress }]]);

	function render(indexerEntries: readonly IndexerEntry[]) {
		const indexers = Array.from(new Map(indexerEntries).entries()).map(
			([chainId, { address }]) => ({ chainId, address }),
		);

		return div().children(
			FeedScroller(
				new Feed({
					id: params.feedId,
					direction: -1n,
					limit: 64,
					indexers,
				}),
			),
		);
	}
}
