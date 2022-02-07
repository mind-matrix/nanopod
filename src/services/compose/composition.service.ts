import { injectable } from "inversify";
import { glob } from "glob";
import { CompositionInputDto } from "./composition-input.dto";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";
import { ICompositionService } from "./composition-service.interface";

@injectable()
export class CompositionService implements ICompositionService {
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
        const allFiles = glob.sync(path.join(dto.path, "**/*"))
        const excludedFilesFromConfig = dto.config.exclude.map(pattern => glob.sync(path.join(dto.path, pattern))).flat()
        const defaultExcludedFiles = [".pod","*.pod"].map(pattern => glob.sync(path.join(dto.path, pattern))).flat()
        const excludedFiles = Array.from(new Set([ ...excludedFilesFromConfig, ...defaultExcludedFiles]))
        const includedFiles = allFiles.filter(item => !excludedFiles.includes(item))
        const fd = fs.createWriteStream(path.join(dto.path, ".pod"), { encoding: "utf8" })
        for (const file of includedFiles) {
            const fileHash = await this.computeHash(file)
            fd.write(`${file} => ${fileHash}\n`)
        }
        fd.close()
    }
}