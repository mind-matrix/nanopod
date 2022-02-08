import { inject, injectable } from "inversify";
import { IPodParser } from "../shared/pod-parser/pod-parser.interface";
import { IPodRecord } from "../shared/pod-parser/pod-record.interface";
import { TYPES } from "../types";

@injectable()
export class PodParser {
    @inject(TYPES.PodParser) private podParser: IPodParser

    async parse(data: string) {
        return await this.podParser.parse(data)
    }

    async unparse(data: IPodRecord[]) {
        return await this.podParser.unparse(data)
    }
}