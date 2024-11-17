import { Feed } from "~/features/feed/Feed";

export function asc(): Feed.Direction {
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

export function desc(): Feed.Direction {
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

export function random(prefer: "newer" | "older"): Feed.Direction {
	return {
		*indexIterator(length) {
			// create the pool of indices
			const pool = Array.from({ length: Number(length) }, (_, i) => BigInt(i));

			// Fisher-Yates shuffle to randomize the pool
			for (let i = pool.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[pool[i]!, pool[j]!] = [pool[j]!, pool[i]!];
			}

			// yield indices from the shuffled pool
			for (const index of pool) {
				yield index;
			}
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

export function randomNoAlloc(prefer: "newer" | "older"): Feed.Direction {
	// Simple hash function to apply deterministic randomness using only bigint
	function fractalHash(n: bigint, seed: bigint) {
		let x = n ^ seed; // XOR the seed with the index (as a bigint)
		x = (x * 0x517cc1b727220a95n) & 0xffffffffffffffffn; // Multiply and truncate, still as bigint
		x = (x ^ (x >> 32n)) & 0xffffffffffffffffn; // XOR and shift for more randomness
		return x;
	}

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
