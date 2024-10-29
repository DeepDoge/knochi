import "~/features/post/database/client";

import { fragment, tags } from "@purifyjs/core";
import { feedGroupFormDialog } from "~/app/feed/feedGroupFormDialog";
import { Layout } from "~/app/Layout";
import { manifest } from "~/app/manifest";
import { progressListElement } from "~/lib/progress/mod";
import { connectWallet } from "~/lib/wallet/connectDialog";

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
