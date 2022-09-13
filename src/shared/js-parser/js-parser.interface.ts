import { IPodRecord } from "../pod-parser/pod-record.interface";

export interface IJsParser {
    parse(data: string, scopeId: string, records?: IPodRecord[]): Promise<string>
}