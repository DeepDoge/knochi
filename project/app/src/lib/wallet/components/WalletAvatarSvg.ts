import jazzicon from "jazzicon-ts";
import { Address } from "~/lib/solidity/primatives";

export function WalletAvatarSvg(address: Address) {
	const iconWrapper = jazzicon(64, parseInt(address.slice(2, 10), 16));
	const iconSvg = iconWrapper.firstElementChild as SVGSVGElement;
	iconSvg.setAttribute("viewBox", `0 0 64 64`);
	iconSvg.setAttribute("width", "100%");
	iconSvg.setAttribute("height", "100%");
	iconSvg.style.backgroundColor = iconWrapper.style.backgroundColor;
	iconSvg.style.borderRadius = "50%";

	return iconSvg;
}
