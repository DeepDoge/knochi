// TODO: This needs a refactor, and all other dialogs, probably

import { tags } from "@purifyjs/core";
import { FeedGroupForm } from "~/features/feed/components/FeedGroupForm";
import { Router } from "~/shared/router";
import { useClickClose } from "~/shared/utils/effects/useClickClose";
import { useCloseOnDisconnect } from "~/shared/utils/effects/useCloseOnDisconnect";

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
