import "~/features/feed/database/client";
import "~/features/post/database/client";

import { fragment, tags } from "@purifyjs/core";
import { Layout } from "~/app/layout/Layout";
import { manifest } from "~/app/manifest";
import { feedGroupFormDialog } from "~/features/feed/feedGroupFormDialog";
import { progressListElement } from "~/shared/progress";
import { connectWallet } from "~/shared/wallet/connectDialog";

const { link } = tags;

document.head.append(
	fragment(
		link()
			.rel("manifest")
			.href(`data:application/json,${encodeURIComponent(JSON.stringify(manifest))}`),
	),
);

document.body.append(
	fragment(Layout(), feedGroupFormDialog, connectWallet.dialog, progressListElement),
);

console.log(123);
