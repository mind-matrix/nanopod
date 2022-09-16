import { IJsParser } from "./js-parser.interface";
import { injectable } from "inversify";
import { IPodRecord } from "../pod-parser/pod-record.interface";
import { parseScript } from "esprima";
import { walk } from "esprima-walk";
import { extname } from "path/posix";
import { generate } from "escodegen";

@injectable()
export class JsParser implements IJsParser {
    async parse(data: string, scopeId: string, records: IPodRecord[]): Promise<string> {
        const ast = parseScript(data)
        walk(ast, (node) => {
            if (node && node.type == "Literal" && node.value && typeof(node.value) == "string") {
                const extension = extname(node.value.trim())
                const url = node.value.trim().replace(/^.?\//g, "")
                const record = records.find(r => r.path == url)
                if (record) {
                    node.value = "resources/"+record.hash+extension
                }
            }
        })
        const compiled = generate(ast)
        return compiled
    }
}