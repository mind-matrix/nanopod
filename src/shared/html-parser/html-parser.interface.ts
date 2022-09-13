import { IPodRecord } from "../pod-parser/pod-record.interface";

export interface IHtmlParser {
    parse(data: string, scopeId: string, records?: IPodRecord[]): Promise<string>
}