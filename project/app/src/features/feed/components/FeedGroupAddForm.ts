import { awaited, ref, tags } from "@purifyjs/core";
import { FeedGroupIconSvg } from "~/features/feed/components/FeedGroupIconSvg";
import { feedDB } from "~/features/feed/database/client";
import { PromiseOrValue } from "~/shared/types/promise";
import { Utils } from "~/shared/types/utils";
import { css, useScope } from "~/shared/utils/css";
import { useBind } from "~/shared/utils/effects/useBind";

const { form, button, strong, label, div, input } = tags;

type FeedGroup = ReturnType<(typeof feedDB.lastVersion.models.FeedGroup)["parser"]>;
type FeedGroupItem = ReturnType<(typeof feedDB.lastVersion.models.FeedGroupItem)["parser"]>;

export function FeedGroupAddForm(params: {
	values: Utils.FixedOmit<FeedGroupItem, "groupId">;
	groups: PromiseOrValue<FeedGroup[]>;
	onDone?: () => void;
}) {
	async function add(groupId: string) {
		await feedDB
			.add("FeedGroupItem")
			.values({
				groupId,
				...params.values,
				style: {
					...params.values.style,
					label: feedLabel.val,
				},
			})
			.execute();
	}

	const feedLabel = ref(params.values.style.label ?? "");
	const busy = ref(false);

	function renderGroups(groups: FeedGroup[]) {
		return div({ class: "groups" }).children(
			groups.map((group) => {
				return button()
					.name("group")
					.value(group.groupId)
					.children(
						FeedGroupIconSvg(group),
						strong().title(group.name).textContent(group.name),
					);
			}),
		);
	}

	return form()
		.effect(useScope(FeedGroupAddFormCss))
		.onsubmit(async (event) => {
			event.preventDefault();
			busy.val = true;
			try {
				const formData = new FormData(event.currentTarget, event.submitter);
				const groupId = formData.get("group");
				if (typeof groupId !== "string") return;
				await add(groupId);
				params.onDone?.();
			} finally {
				busy.val = false;
			}
		})
		.children(
			div({ class: "fields" }).children(
				label().children(
					strong().textContent("feed label"),
					input({ class: "input" })
						.required(true)
						.type("text")
						.effect(useBind(feedLabel, "value", "input"))
						.defaultValue(params.values.style.label ?? "")
						.placeholder("..."),
				),
				label().children(
					strong().textContent("select group"),
					params.groups instanceof Promise ?
						awaited(params.groups.then(renderGroups))
					:	renderGroups(params.groups),
				),
			),
		);
}

const FeedGroupAddFormCss = css`
	.fields {
		display: block grid;
		gap: 1.5em;
	}

	label {
		display: block grid;
		gap: 0.5em;
	}

	.groups {
		display: block grid;
		grid-template-columns: repeat(auto-fit, minmax(0, 5em));
		justify-content: center;
		gap: 1em;
	}

	button[name="group"] {
		display: block grid;

		strong {
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
`;
