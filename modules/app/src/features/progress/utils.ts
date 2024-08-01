import { computed, ref, tags } from "purified-js";
import { PreloadSvg } from "~/assets/svgs/PreloadSvg";
import { style } from "~/utils/style";

const DELETE_TIMEOUT_MS = 5 * 1000;

const listStyle = style`
    display: grid;

    --margin: 0.5em;

    position: fixed;
    inset-block-end: var(--margin);
    inset-inline-end: var(--margin);

    inline-size: min(100%, 15em);
    gap: 0.5em;
`;

const itemStyle = style`
    list-style: none;

    display: grid;
    grid-auto-flow: column;
    align-items: center;
    justify-content: start;
    gap: 0.5em;
    padding-inline: 1em;
    padding-block: 0.75em;

    background-color: var(--light);
    color: var(--dark);
    border-radius: var(--radius);
`;

const { ul, li, strong } = tags;

const progressList = ul({ class: listStyle });
document.body.append(progressList.element);

export function trackPromise<T extends Promise<unknown>>(title: string, promise: T) {
	const status = ref<"progress" | "success" | "fail">("progress");
	promise.then(() => {
		status.val = "success";
	});
	promise.catch(() => {
		status.val = "fail";
	});
	promise.finally(() => {
		setTimeout(() => {
			progressItem.element.remove();
		}, DELETE_TIMEOUT_MS);
	});

	const dynamic = computed<{
		icon: SVGSVGElement | null;
		background: string;
		color: string;
		busy: boolean;
	}>(() => {
		switch (status.val) {
			case "progress":
				return {
					icon: PreloadSvg("1.5em"),
					background: "var(--light)",
					color: "var(--dark)",
					busy: true,
				};
			case "success":
				return {
					icon: null,
					background: "var(--success)",
					color: "var(--dark)",
					busy: false,
				};
			case "fail":
				return {
					icon: null,
					background: "var(--fail)",
					color: "var(--dark)",
					busy: false,
				};
		}
		status.val satisfies never;
	});

	const progressItem = li({ class: itemStyle })
		.ariaBusy(computed(() => String(dynamic.val.busy)))
		.children(
			computed(() => dynamic.val.icon),
			strong().textContent(title),
		);
	progressList.children(progressItem);

	return promise;
}
