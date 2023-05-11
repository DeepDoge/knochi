import globalCss from "@/styles/global.css?inline"
import rootCss from "@/styles/root.css?inline"
import { Component } from "master-ts/library/component"

const globalSheet = new CSSStyleSheet()
const rootSheet = new CSSStyleSheet()

await Promise.all([globalSheet.replace(globalCss), rootSheet.replace(rootCss)])

Component.$globalStyleSheets.push(globalSheet)
document.adoptedStyleSheets.push(rootSheet, globalSheet)
