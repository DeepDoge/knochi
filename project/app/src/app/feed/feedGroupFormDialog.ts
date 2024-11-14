import { tags } from "@purifyjs/core";
import { FeedGroupForm } from "~/app/feed/components/FeedGroupForm.ts";
import { Router } from "~/domains/router/mod.ts";
import { useClickClose } from "~/shared/effects/useClickClose.ts";
import { useCloseOnDisconnect } from "~/shared/effects/useCloseOnDisconnect.ts";

const { dialog } = tags;

export const feedGroupFormDialogSearchParam = new Router.SearchParam<"create" | `update:${string}`>(
	"group-form",
);

export const feedGroupFormDialog = dialog()
	.effect((element) => {
		return feedGroupFormDialogSearchParam.follow((value) => {
			if (value) {
				element.showModal();
			} else {
				element.close();
			}
		}, true);
	})
	.effect(useCloseOnDisconnect())
	.effect(useClickClose())
	.onclose((event) => {
		event.preventDefault();
		feedGroupFormDialogSearchParam.val = null;
	})
	.children(
		feedGroupFormDialogSearchParam
			.derive((value) =>
				value?.startsWith("update:") ? value.slice("update:".length) : null,
			)
			.derive((id) =>
				FeedGroupForm({
					id,
					onDone() {
						feedGroupFormDialogSearchParam.val = null;
					},
				}),
			),
	);
