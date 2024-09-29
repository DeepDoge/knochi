import { MemberOf, ref, tags } from "purify-js";
import { ErrorSvg } from "~/assets/svgs/ErrorSvg";
import { LoadingSvg } from "~/assets/svgs/LoadingSvg";
import { SuccessSvg } from "~/assets/svgs/SuccessSvg";
import { rootSheet } from "~/styles";
import { css } from "~/utils/style";

const DELETE_TIMEOUT_MS = 5 * 1000;

const { div, ul, li, strong, small } = tags;

const progressHost = div();
const shadow = progressHost.element.attachShadow({ mode: "open" });

const progressList = ul();
shadow.append(progressList.element);

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
					background: "var(--accent)",
					color: "var(--base)",
					busy: true,
				};
			case "success":
				return {
					icon: SuccessSvg(),
					background: "var(--success)",
					color: "var(--accent)",
					busy: false,
				};
			case "fail":
				return {
					icon: ErrorSvg(),
					background: "var(--fail)",
					color: "var(--accent)",
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
	progressList.element.prepend(progressItem.element);

	return promise;
}

const progressSheet = css`
	ul {
		display: grid;
		padding: 0;

		--margin: 0.5em;

		position: fixed;
		inset-block-end: var(--margin);
		inset-inline-end: var(--margin);

		inline-size: min(100%, 15em);
		gap: 0.4em;
	}

	li {
		list-style: none;

		display: grid;
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

		background-color: var(--accent);
		color: var(--base);
		border-radius: var(--radius);
	}
`;

shadow.adoptedStyleSheets.push(rootSheet, progressSheet);
document.body.append(progressHost.element);
