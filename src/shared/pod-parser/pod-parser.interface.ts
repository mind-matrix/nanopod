import { IPodRecord } from "./pod-record.interface"

export interface IPodParser {
    parse(data: string): Promise<IPodRecord[]>
    unparse(data: IPodRecord[]): Promise<string>
}