import { injectable } from "inversify";
import { CleanInputDto } from "./clean-input.dto";
import { ICleanService } from "./clean-service.interface";
import { glob } from "glob";
import * as path from "path";
import * as fs from "fs";

@injectable()
export class CleanService implements ICleanService {
    async clean(dto: CleanInputDto) {
        const allFiles = [".pod","*.pod"].map(pattern => glob.sync(path.join(dto.path, pattern))).flat()
        const excludedFiles = Array.from(new Set(dto.exclude.map(pattern => glob.sync(pattern)).flat()))
        const podFilePath = path.join(dto.path, ".pod").replace(/\\/g, '/')
        if (dto.excludePodFile && !excludedFiles.includes(podFilePath)) {
            excludedFiles.push(podFilePath)
        }
        const includedFiles = allFiles.filter(path => !excludedFiles.includes(path))
        for (const file of includedFiles) {
            fs.rmSync(file)
        }
    }
}