import { computed, fragment, ref, tags } from "@purifyjs/core";
import { FeedItem } from "~/app/feed/FeedItem";
import { ArrowDownSvg } from "~/assets/svgs/ArrowDownSvg";
import { ReloadSvg } from "~/assets/svgs/ReloadSvg";
import { css, useScope } from "~/shared/css";
import { useOnVisible } from "~/shared/effects/useOnVisible";
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

	let nextGenerator: ReturnType<typeof feed.nextGenerator> | undefined;

	const loadingMore = ref(false);
	const refresing = ref(false);
	const done = ref(false);
	const busy = computed(() => loadingMore.val || refresing.val);
	const loadMoreDisabled = computed(() => busy.val || done.val);

	async function loadNext({ clear = false } = {}) {
		if (!nextGenerator) return;

		const start = Date.now();
		const result = await nextGenerator.next();
		const passed = Date.now() - start;

		done.val = Boolean(result.done);

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
		if (loadMoreDisabled.val) return;

		try {
			loadingMore.val = true;
			await loadNext();
		} catch (error) {
			console.error(error);
		} finally {
			loadingMore.val = false;
		}
	}

	async function refresh() {
		if (busy.val) return;

		try {
			refresing.val = true;
			nextGenerator = feed.nextGenerator();
			await loadNext({ clear: true });
		} catch (error) {
			console.error(error);
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
			.effect(
				useOnVisible(() => {
					let visible = true;
					Promise.resolve().then(async () => {
						while (visible) {
							await new Promise((resolve) => setTimeout(resolve, 100));
							await loadMore();
						}
					});
					return () => (visible = false);
				}),
			)
			.ariaBusy(loadingMore.derive(String))
			.disabled(loadMoreDisabled)
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
		gap: 1em;
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
