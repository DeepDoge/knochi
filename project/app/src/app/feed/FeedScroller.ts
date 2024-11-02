import { computed, fragment, ref, tags } from "@purifyjs/core";
import { FeedItem } from "~/app/feed/FeedItem";
import { ArrowDownSvg } from "~/assets/svgs/ArrowDownSvg";
import { ReloadSvg } from "~/assets/svgs/ReloadSvg";
import { css, useScope } from "~/lib/css";
import { Feed } from "../../features/feed/lib/Feed";

const { div, section, button } = tags;

export function FeedScroller(feed: Feed) {
	const host = section()
		.effect(useScope(FeedScrollerCss))
		.effect(() => {
			refresh();
		})
		.ariaLabel("Feed");

	const posts = div({ class: "posts" });

	let nextGenerator = feed.nextGenerator();

	const loadingMore = ref(false);
	const refresing = ref(false);
	const busy = computed(() => loadingMore.val || refresing.val);

	async function loadNext({ clear = false } = {}) {
		const start = Date.now();
		const result = await nextGenerator.next();
		const passed = Date.now() - start;
		// Give animation time to play.
		await new Promise((resolve) => setTimeout(resolve, Math.max(0, 1000 - passed)));

		const newFragment = fragment(result.value?.map((post) => FeedItem(post)) ?? null);

		if (clear) {
			posts.element.replaceChildren(newFragment);
		} else {
			posts.element.append(newFragment);
		}
	}
	async function loadMore() {
		try {
			if (busy.val) return;
			loadingMore.val = true;
			await loadNext();
		} finally {
			loadingMore.val = false;
		}
	}
	async function refresh() {
		try {
			if (busy.val) return;
			refresing.val = true;
			nextGenerator = feed.nextGenerator();
			await loadNext({ clear: true });
		} finally {
			refresing.val = false;
		}
	}

	return host.children(
		button({ class: "load refresh" })
			.ariaBusy(refresing.derive(String))
			.disabled(busy)
			.ariaLabel("Refresh")
			.onclick(refresh)
			.children(ReloadSvg()),
		posts,
		button({ class: "load more" })
			.ariaBusy(loadingMore.derive(String))
			.disabled(busy)
			.ariaLabel("Load More")
			.onclick(loadMore)
			.children(ArrowDownSvg()),
	);
}

const FeedScrollerCss = css`
	:scope {
		display: grid;
		gap: 2em;
	}

	.posts {
		display: grid;
		--gap: 1em;
		gap: var(--gap);

		& > * + * {
			border-block-start: solid 0.1em color-mix(in srgb, var(--base), var(--pop) 25%);
			padding-block-start: var(--gap);
		}
	}

	button.load {
		display: grid;
		grid-template-columns: 1.5em;
	}

	button.refresh {
		justify-self: center;
		&[aria-busy="true"] {
			animation: refresh 1s linear infinite;
		}
	}

	@keyframes refresh {
		to {
			rotate: 360deg;
		}
	}

	button.more {
		justify-self: center;

		transition: 0.1s linear;
		transition-property: translate;

		--offset: 1em;
		margin-block-end: var(--offset);
		&:disabled {
			translate: 0 var(--offset);
		}
	}
`;
