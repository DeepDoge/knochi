import { FeedPage } from "~/app/feed/FeedPage";
import { Feed } from "~/features/feed/lib/Feed";
import { Router } from "~/shared/router/mod";
import { Address, Hex } from "~/shared/solidity/primatives";

export const feedRoutes = {
	feed: new Router.Route({
		fromPathname(pathname) {
			return Feed.Id()
				.transform((feedId) => ({ feedId }))
				.parse(pathname.split("/"));
		},
		toPathname(data) {
			return data.feedId;
		},
		render(data) {
			return data.feedId ? FeedPage(data) : null;
		},
		title() {
			return "Feed";
		},
	}),
};

export const feedGroupSearchParam = new Router.SearchParam("group");
export const feedItemSearchParam = new Router.SearchParam("post");

export namespace FeedItemSearchParam {
	export function toString(params: {
		chainId: bigint;
		indexerAddress: Address;
		feedId: Feed.Id;
		index: bigint;
	}) {
		if (!params) return null;
		return `${params.chainId.toString(16)}-${params.indexerAddress.slice(2)}-${params.feedId.slice(2)}-${params.index.toString(16)}` as const;
	}

	export function fromString(value: string | null) {
		if (!value) return null;
		const [
			chainIdHex0xOmitted,
			indexerAddressHex0xOmitted,
			feedIdHex0xOmitted,
			indexHex0xOmmited,
		] = value.split("-");
		if (!chainIdHex0xOmitted) return null;
		if (!indexerAddressHex0xOmitted) return null;
		if (!indexHex0xOmmited) return null;
		if (!feedIdHex0xOmitted) return null;

		const chainId = Hex().transform(BigInt).safeParse(`0x${chainIdHex0xOmitted}`);
		if (!chainId.success) return null;
		const indexerAddress = Address().safeParse(`0x${indexerAddressHex0xOmitted}`);
		if (!indexerAddress.success) return null;
		const index = Hex().transform(BigInt).safeParse(`0x${indexHex0xOmmited}`);
		if (!index.success) return null;
		const feedId = Feed.Id().safeParse(`0x${feedIdHex0xOmitted}`);
		if (!feedId.success) return null;

		return {
			chainId: chainId.data,
			indexerAddress: indexerAddress.data,
			feedId: feedId.data,
			index: index.data,
		};
	}
}
