import versionLabel from "@graph/version.json"
import { Client, fetchExchange } from "@urql/core"

const client = new Client({
	url: `https://api.studio.thegraph.com/query/45351/dforum-sepolia/${versionLabel}`,
	exchanges: [fetchExchange],
})
