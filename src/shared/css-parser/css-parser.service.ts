import { ICssParser } from "./css-parser.interface";
import { injectable } from "inversify";
import { IPodRecord } from "../pod-parser/pod-record.interface";
import { render } from "less";
import * as csstree from 'css-tree';
import { extname } from "path/posix";

@injectable()
export class CssParser implements ICssParser {
    async parse(data: string, scopeId: string, records: IPodRecord[]): Promise<string> {
        const scoped = await (new Promise<string>((resolve, reject) => {
            render(`#${scopeId} { ${data} }`, (err, output) => {
                if (err) return reject(err)
                return resolve(output.css)
            })
        }))
        const ast = csstree.parse(scoped)
        csstree.walk(ast, (node) => {
            if (node.type == "Url") {
                const extension = extname((<string><unknown>node.value).trim())
                const url = (<string><unknown>node.value).trim().replace(/^.?\//g, "")
                const record = records.find(r => r.path == url)
                if (record) {
                    (<string><unknown>node.value) = "resources/"+record.hash+extension
                }
            }
        })
        const compiled = csstree.generate(ast)
        return compiled
    }
}