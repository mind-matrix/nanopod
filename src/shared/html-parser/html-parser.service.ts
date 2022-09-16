import { IHtmlParser } from "./html-parser.interface";
import { inject, injectable } from "inversify";
import { IPodRecord } from "../pod-parser/pod-record.interface";
import { parseFragment, serializeOuter } from "parse5";
import { extname } from "path/posix";
import { CssParser } from "../css-parser/css-parser.service";
import { TYPES } from "../../types";
import { JsParser } from "../js-parser/js-parser.service";

@injectable()
export class HtmlParser implements IHtmlParser {

    @inject(TYPES.CssParser) private cssParser: CssParser
    @inject(TYPES.JsParser) private jsParser: JsParser

    async parse(data: string, scopeId: string, records: IPodRecord[]): Promise<string> {
        const fragment = parseFragment(data)
        for (let node of fragment.childNodes) {
            if ('attrs' in node) {
                const refs = node.attrs.filter(attr => ["src","href"].includes(attr.name))
                for (const ref of refs) {
                    const extension = extname(ref.value.trim())
                    const url = ref.value.trim().replace(/^.?\//g, "")
                    const record = records.find(r => r.path == url)
                    if (record) {
                        ref.value = "resources/"+record.hash+extension
                    }
                }
            }
            if (node.nodeName == "style") {
                for (const txtNode of node.childNodes.filter(node => node.nodeName == "#text").map(node => node as { value: string })) {
                    txtNode.value = await this.cssParser.parse(txtNode.value, scopeId, records)
                }
            }
            if (node.nodeName == "script") {
                console.log(node)
                for (const txtNode of node.childNodes.filter(node => node.nodeName == "#text").map(node => node as { value: string })) {
                    txtNode.value = await this.jsParser.parse(txtNode.value, scopeId, records)
                }
            }
        }
        const compiled = fragment.childNodes.map(node => serializeOuter(node)).join("")
        return `<x-pod id="${scopeId}">${compiled}</x-pod>`
    }
}