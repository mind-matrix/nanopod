import { inject, injectable } from "inversify";
import { glob } from "glob";
import { CompositionInputDto } from "./composition-input.dto";
import * as path from "path/posix";
import * as fs from "fs";
import * as crypto from "crypto";
import { ICompositionService } from "./composition-service.interface";
import { PodParser } from "../../shared/pod-parser/pod-parser.service";
import { TYPES } from "../../types";
import { IPodRecord } from "../../shared/pod-parser/pod-record.interface";

@injectable()
export class CompositionService implements ICompositionService {
    
    @inject(TYPES.PodParser) private podParser: PodParser

    computeHash(filepath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const fd = fs.createReadStream(filepath)
            const hash = crypto.createHash("sha1")
            hash.setEncoding("hex")
            fd.on("end", () => {
                hash.end()
                resolve(hash.read())
            })
            fd.on("error", (err) => {
                reject(err)
            })
            fd.pipe(hash)
        })
    }
    
    async compose(dto: CompositionInputDto): Promise<void> {
        const allFiles = glob.sync(path.join(dto.path, "**/*")).filter(file => !fs.lstatSync(file).isDirectory())
        const excludedFilesFromConfig = dto.config.exclude.map(pattern => glob.sync(path.join(dto.path, pattern))).flat()
        const defaultExcludedFiles = [".pod","*.pod"].map(pattern => glob.sync(path.join(dto.path, pattern))).flat()
        const excludedFiles = Array.from(new Set([ ...excludedFilesFromConfig, ...defaultExcludedFiles]))
        const includedFiles = allFiles.filter(item => !excludedFiles.includes(item))
        const records: IPodRecord[] = []
        for (const file of includedFiles) {
            const fileHash = await this.computeHash(file)
            const basename = path.basename(file)
            const filePath = path.relative(dto.path, file)
            records.push({ hash: fileHash, path: filePath } as IPodRecord)
            if (["index.html","index.htm"].includes(basename)) {
                records.push({ hash: fileHash, path: path.dirname(filePath) })
            }
        }
        fs.writeFileSync(path.join(dto.path, ".pod"), await this.podParser.unparse(records), { encoding: "utf8" })
    }
}