import { IPodRecord } from "../pod-parser/pod-record.interface";

export interface ICssParser {
    parse(data: string, scopeId: string, records?: IPodRecord[]): Promise<string>
}