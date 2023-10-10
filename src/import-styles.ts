import globalCss from "@/styles/global.css?inline"
import rootCss from "@/styles/root.css?inline"

export const commonStyle = new CSSStyleSheet()
const rootStyle = new CSSStyleSheet()

await Promise.all([commonStyle.replace(globalCss), rootStyle.replace(rootCss)])

document.adoptedStyleSheets.push(rootStyle, commonStyle)
