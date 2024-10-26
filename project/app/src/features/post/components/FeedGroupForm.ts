import { ref, tags } from "@purifyjs/core";
import { postDb } from "~/features/post/database/client";
import { bind } from "~/lib/actions/bind";
import { clickClose } from "~/lib/actions/clickClose";
import { Router } from "~/lib/router/mod";

const { dialog, div, form, label, strong, input, button } = tags;

async function save(params: { id?: string | null; name: string }): Promise<{ id: string }> {
	const index = ((await postDb.find("FeedGroup").many({ by: "index", order: "prev" }, 1)).at(0)?.index ?? -1) + 1;

	if (params.id) {
		await postDb.set("FeedGroup").byKey([params.id], { groupId: params.id, name: params.name, index }).execute();
		return { id: params.id };
	} else {
		const id = crypto.randomUUID();
		await postDb.add("FeedGroup").values({ groupId: id, name: params.name, index }).execute();
		return { id };
	}
}

export function FeedGroupForm(params: { id?: string | null; onDone?: () => void }) {
	const name = ref("");

	const busy = ref(false);

	return form()
		.onsubmit((event) => {
			event.preventDefault();
			busy.val = true;
			save({ id: params.id, name: name.val }).finally(() => {
				busy.val = false;
				params.onDone?.();
			});
		})
		.children(
			div({ class: "fields" }).children(
				label().children(
					strong().textContent("Name"),
					input({ class: "input" })
						.type("text")
						.minLength(1)
						.required(true)
						.use(bind(name, "value", "input"))
						.placeholder("group name"),
				),
			),
			button({ class: "button" })
				.disabled(busy)
				.textContent(params.id ? "Update" : "Create"),
		);
}

export const feedGroupFormDialogSearchParam = new Router.SearchParam<"create" | `update:${string}`>("group-form");

export const feedGroupFormDialog = dialog()
	.use((element) => {
		return feedGroupFormDialogSearchParam.follow((value) => {
			if (value) {
				element.showModal();
			} else {
				element.close();
			}
		}, true);
	})
	.use((element) => () => element.close())
	.use(clickClose())
	.onclose((event) => {
		event.preventDefault();
		feedGroupFormDialogSearchParam.val = null;
	})
	.children(
		feedGroupFormDialogSearchParam
			.derive((value) => (value?.startsWith("update:") ? value.slice("update:".length) : null))
			.derive((id) =>
				FeedGroupForm({
					id,
					onDone() {
						feedGroupFormDialogSearchParam.val = null;
					},
				}),
			),
	);
