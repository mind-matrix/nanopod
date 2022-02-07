import { IPodParser } from "./pod-parser.interface";
import { IPodRecord } from "./pod-record.interface";
import { EOL } from "os";
import { injectable } from "inversify";

@injectable()
export class PodParser implements IPodParser {
    async parse(data: string): Promise<IPodRecord[]> {
        const lines = data.trim().split(/\r?\n/)
        const records: IPodRecord[] = []
        for (const line of lines) {
            const [ path, hash ] = line.split(" => ")
            records.push({ path, hash })
        }
        return records
    }

    async unparse(data: IPodRecord[], line_separator = EOL): Promise<string> {
        const recordStrings: string[] = []
        for (const record of data) {
            recordStrings.push(`${record.path} => ${record.hash}`)
        }
        return recordStrings.join(line_separator)
    }
}