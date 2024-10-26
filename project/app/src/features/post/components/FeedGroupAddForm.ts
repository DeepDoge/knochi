import { awaited, ref, tags } from "@purifyjs/core";
import { FeedGroupIcon } from "~/features/post/components/FeedGroupIcon";
import { postDb } from "~/features/post/database/client";
import { Feed } from "~/features/post/lib/Feed";

const { form, button, strong } = tags;

export function FeedGroupAddForm(params: { feedId: Feed.Id; label: string; icon: string; onDone?: () => void }) {
	async function add(groupId: string) {
		await postDb
			.add("FeedGroupItem")
			.values({
				groupId,
				feedId: params.feedId,
				label: params.label,
				icon: params.icon,
			})
			.execute();
	}

	const busy = ref(false);

	const groupsPromise = postDb.find("FeedGroup").many();

	return form()
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
			awaited(groupsPromise).derive((groups) => {
				if (!groups) {
					return null; // loading
				}

				return groups.map((group) => {
					return button()
						.name("group")
						.value(group.groupId)
						.children(FeedGroupIcon(group.name), strong().textContent(group.name));
				});
			}),
		);
}
