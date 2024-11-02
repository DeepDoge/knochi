import { ref, tags } from "@purifyjs/core";
import { postDb } from "~/features/feed/database/client";
import { useBind } from "~/lib/effects/useBind";

const { div, form, label, strong, input, button } = tags;

async function save(params: { id?: string | null; name: string }): Promise<{ id: string }> {
	const index =
		((await postDb.find("FeedGroup").many({ by: "index", order: "prev" }, 1)).at(0)?.index ??
			-1) + 1;

	if (params.id) {
		await postDb
			.set("FeedGroup")
			.byKey([params.id], { groupId: params.id, name: params.name, index })
			.execute();
		return { id: params.id };
	} else {
		const id = crypto.randomUUID().split("-").at(0)!;
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
						.effect(useBind(name, "value", "input"))
						.placeholder("group name"),
				),
			),
			button({ class: "button" })
				.disabled(busy)
				.textContent(params.id ? "Update" : "Create"),
		);
}
