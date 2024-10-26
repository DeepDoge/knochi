import { awaited, ref, tags } from "@purifyjs/core";
import { FeedGroupIcon } from "~/features/post/components/FeedGroupIcon";
import { postDb } from "~/features/post/database/client";
import { Feed } from "~/features/post/lib/Feed";
import { css, scope } from "~/lib/css";
import { PromiseOrValue } from "~/lib/types/promise";

const { form, button, strong } = tags;

type FeedGroup = ReturnType<(typeof postDb.lastVersion.models.FeedGroup)["parser"]>;

export function FeedGroupAddForm(params: {
	values: { feedId: Feed.Id; label: string; icon: string };
	groups: PromiseOrValue<FeedGroup[]>;
	onDone?: () => void;
}) {
	async function add(groupId: string) {
		await postDb
			.add("FeedGroupItem")
			.values({
				groupId,
				feedId: params.values.feedId,
				label: params.values.label,
				icon: params.values.icon,
			})
			.execute();
	}

	const busy = ref(false);

	function renderGroups(groups: FeedGroup[]) {
		return groups.map((group) => {
			return button()
				.name("group")
				.value(group.groupId)
				.children(FeedGroupIcon(group.name), strong().textContent(group.name));
		});
	}

	return form()
		.use(scope(FeedGroupAddFormCss))
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
			params.groups instanceof Promise ?
				awaited(params.groups.then(renderGroups))
			:	renderGroups(params.groups),
		);
}

const FeedGroupAddFormCss = css`
	:scope {
		display: block grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 4em), 1fr));
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
