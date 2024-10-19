import { PostIndexer } from "@root/contracts/connect";
import { JsonRpcProvider } from "ethers";
import { currentConfig } from "~/features/config/state";
import { Post } from "~/features/post/utils/Post";
import { Address, Hex } from "~/utils/solidity/primatives";

export class Feed {
	public readonly id: Feed.Id;
	public readonly direction: Feed.Direction;
	public readonly chainIds: bigint[];
	public readonly limit: number;

	constructor(init: Feed.Init) {
		this.id = init.id;
		this.direction = init.direction;
		this.limit = init.limit;
		this.chainIds = init.chainIds;
	}

	public async *previousGenerator(): AsyncGenerator<Post[]> {}

	public async *nextGenerator() {
		const chains = this.chainIds.map((chainId) => {
			return {
				chainId,
				index: this.direction > 0 ? 0n : null,
				queue: [] as Post[],
			};
		});

		while (true) {
			await Promise.allSettled(
				chains.map(async (chain) => {
					const take = Math.max(0, this.limit - chain.queue.length);
					if (!take) return;

					const network = currentConfig.val.networks[`${chain.chainId}`];
					if (!network) {
						return [];
					}

					const provider = new JsonRpcProvider(network.providers[0]);
					const indexerContract = PostIndexer.connect(provider, network.contracts.PostIndexer);

					const length = await indexerContract.length(this.id);
					chain.index ??= length - 1n;

					const posts: Promise<Post>[] = [];

					for (let i = 0n; i < take; i++) {
						const index = chain.index + i * this.direction;
						if (index < 0) break;
						if (index >= length) break;
						console.log(index);
						posts.push(Post.load({ network, feedId: this.id, index }));
					}
					chain.index += BigInt(posts.length) * this.direction;

					chain.queue.push(
						...(await Promise.allSettled(posts))
							.filter((result) => result.status === "fulfilled")
							.map((result) => result.value),
					);
				}),
			);

			const result: Post[] = [];

			while (result.length < this.limit) {
				let nextChain: (typeof chains)[number] | null = null;

				for (const chain of chains) {
					const firstPost = chain.queue.at(0);
					const nextPost = nextChain?.queue.at(0);

					if (!firstPost) continue;

					if (!nextPost) {
						nextChain = chain;
						continue;
					}

					if (
						this.direction > 0 ?
							firstPost.createdAt > nextPost.createdAt
						:	firstPost.createdAt < nextPost.createdAt
					) {
						nextChain = chain;
						continue;
					}
				}

				if (!nextChain) break;
				const nextPost = nextChain.queue.shift();
				if (!nextPost) break;
				result.push(nextPost);
			}

			if (!result.length) break;
			yield result;
		}
	}
}

export namespace Feed {
	export type Init = {
		id: Feed.Id;
		direction: Feed.Direction;
		limit: number;
		chainIds: bigint[];
	};
	export type Direction = 1n | -1n;

	export type Id = ReturnType<typeof Id>["_output"];
	export function Id() {
		return Hex();
	}
	export namespace Id {
		export function fromAddress(address: Address): Id {
			return Id().parse(`0x00${address.slice(2)}${"00".repeat(32 - 1 - 20)}`);
		}
	}
}
