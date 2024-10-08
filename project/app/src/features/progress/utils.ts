import { MemberOf, ref, tags } from "purify-js";
import { ErrorSvg } from "~/assets/svgs/ErrorSvg";
import { LoadingSvg } from "~/assets/svgs/LoadingSvg";
import { SuccessSvg } from "~/assets/svgs/SuccessSvg";
import { css, scopeCss } from "~/utils/style";

const DELETE_TIMEOUT_MS = 5 * 1000;

const { ul, li, strong, small } = tags;

const host = ul().id("progress-list");
export const progressListElement = host.element;

export function trackPromise<T extends Promise<unknown>>(
	strongMembers: MemberOf<HTMLElement>,
	smallMembers: MemberOf<HTMLElement> | null,
	promise: T,
) {
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

	const dynamic = status.derive<{
		icon: SVGSVGElement | null;
		background: string;
		color: string;
		busy: boolean;
	}>((status) => {
		switch (status) {
			case "progress":
				return {
					icon: LoadingSvg(),
					background: "var(--pop)",
					color: "var(--base)",
					busy: true,
				};
			case "success":
				return {
					icon: SuccessSvg(),
					background: "var(--success)",
					color: "var(--pop)",
					busy: false,
				};
			case "fail":
				return {
					icon: ErrorSvg(),
					background: "var(--fail)",
					color: "var(--pop)",
					busy: false,
				};
		}
		status satisfies never;
	});

	const progressItem = li({
		style: dynamic.derive((dynamic) =>
			[`background-color:${dynamic.background}`, `color:${dynamic.color}`].join(";"),
		),
	})
		.ariaBusy(dynamic.derive((dynamic) => String(dynamic.busy)))
		.children(
			dynamic.derive((dynamic) => dynamic.icon),
			strong().children(strongMembers),
			smallMembers ? small().children(smallMembers) : null,
		);
	host.element.prepend(progressItem.element);

	return promise;
}

host.use(
	scopeCss(css`
		:scope {
			display: block grid;
			justify-items: end;
			padding: 0;

			--margin: 0.5em;

			position: fixed;
			inset-block-end: var(--margin);
			inset-inline-end: var(--margin);

			inline-size: fit-content;
			max-inline-size: 20em;
			gap: 0.4em;

			z-index: 1;
		}

		li {
			list-style: none;

			display: block grid;
			grid-template-columns: 1.5em 0.4em 1fr;
			grid-template-areas:
				"icon . label"
				"icon . text";
			&:not(:has(small)) {
				grid-template-areas: "icon . label";
			}

			svg {
				grid-area: icon;
			}
			strong {
				grid-area: label;
			}
			small {
				grid-area: text;
			}

			align-items: center;

			padding-inline: 1em;
			padding-block: 0.75em;

			background-color: var(--pop);
			color: var(--base);
			border-radius: var(--radius);
		}
	`),
);
