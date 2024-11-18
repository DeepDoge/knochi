import { Feed } from "~/features/feed/Feed";
import { fractalHash } from "~/shared/math/fractalHash";

export function orderOlder(): Feed.Order {
	return {
		*indexIterator(length) {
			for (let n = 0n; n < length; n++) {
				yield n;
			}
		},
		isCandidateOfOtherSourceBetter(candidatePost, selectedPost) {
			return candidatePost.createdAt > selectedPost.createdAt;
		},
	};
}

export function orderNewer(): Feed.Order {
	return {
		*indexIterator(length) {
			for (let n = 0n; n < length; n++) {
				yield length - n - 1n;
			}
		},
		isCandidateOfOtherSourceBetter(candidatePost, selectedPost) {
			return candidatePost.createdAt < selectedPost.createdAt;
		},
	};
}

export function orderRandom(prefer: "newer" | "older"): Feed.Order {
	return {
		*indexIterator(length) {
			const seed = BigInt(crypto.getRandomValues(new Uint32Array(1))[0]!);

			function* placeIndices(start: bigint, end: bigint): Generator<bigint, void, unknown> {
				if (start >= end) return;

				// Generate a "random-ish" index within the current range
				const rangeLength = end - start;
				const mid = start + rangeLength / 2n; // Use bigint division for mid
				const index = (fractalHash(mid, seed) % rangeLength) + start;

				yield index;

				// Recursively generate for the left and right parts
				yield* placeIndices(start, index);
				yield* placeIndices(index + 1n, end);
			}

			// Start the recursive process with the full range
			yield* placeIndices(0n, length);
		},
		isCandidateOfOtherSourceBetter(candidatePost, selectedPost) {
			if (prefer === "newer") {
				return candidatePost.createdAt < selectedPost.createdAt;
			}

			if (prefer === "older") {
				return candidatePost.createdAt > selectedPost.createdAt;
			}

			prefer satisfies never;
			throw new Error(`Unknown 'prefer' option: ${prefer}`);
		},
	};
}
