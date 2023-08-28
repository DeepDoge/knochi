import { html } from "master-ts/library/template/tags/html"

export function EthereumChainSvg() {
	return html`
		<svg width="100%" height="100%" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M9.9961 0L9.7776 0.7293V21.8904L9.9961 22.1046L19.9937 16.2984L9.9961 0Z" fill="#C0CBF6" />
			<path d="M9.9979 0L0 16.2984L9.9979 22.1046V11.8336V0Z" fill="white" />
			<path d="M9.9962 23.9614L9.873 24.1089V31.6468L9.9962 32.0001L19.9999 18.1582L9.9962 23.9614Z" fill="#C0CBF6" />
			<path d="M9.9979 32V23.9613L0 18.1581L9.9979 32Z" fill="white" />
			<path d="M9.9963 22.116L19.9939 16.3098L9.9963 11.845V22.116Z" fill="#8197EE" />
			<path d="M0 16.3097L9.9979 22.1159V11.8449L0 16.3097Z" fill="#C0CBF6" />
		</svg>
	`[0] as SVGElement
}
