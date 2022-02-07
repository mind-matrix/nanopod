import { inject, injectable } from "inversify";
import path = require("path");
import { PodParser } from "../../shared/pod-parser/pod-parser.service";
import { IPodRecord } from "../../shared/pod-parser/pod-record.interface";
import { TYPES } from "../../types";
import { BuildInputDto } from "./build-input.dto";
import { IBuildService } from "./build-service.interface";
import * as fs from "fs";
import * as archiver from "archiver";
import * as os from "os";

@injectable()
export class BuildService implements IBuildService {

    @inject(TYPES.PodParser) private podParser: PodParser

    archive(outputPath: string, records: IPodRecord[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const output = fs.createWriteStream(outputPath)
            const archive = archiver('zip', {
                zlib: { level: 0 }
            })
            output.on('close', function () {
                resolve()
            })
            output.on('end', function () {
                resolve()
            })
            archive.on('warning', function (err) {
                if (err.code === 'ENOENT') {
                    console.log(`Warning: ${err.message}`)
                } else {
                    reject(err)
                }
            })
            archive.on('error', function (err) {
                reject(err)
            })
            archive.pipe(output)
            archive.append(await this.podParser.unparse(records), { name: ".pod" })
            for (const record of records) {
                archive.append(fs.createReadStream(record.path), { name: record.hash })
            }
            archive.finalize()
        })
    }

    getTimestampForFilename() {
        return new Date().toISOString()
                        .replace(/T/, ' ')
                        .replace(/\..+/, '')
                        .replace(/[-\:\s]/g, '_')
    }

    async build(dto: BuildInputDto): Promise<void> {
        const podFilePath = path.join(dto.path, ".pod")
        if (!fs.existsSync(podFilePath)) {
            throw new Error(`No pod file(s) found. Please run 'nanopod compose "${dto.path}"' before build.`)
        }
        const records = await this.podParser.parse(fs.readFileSync(podFilePath).toString())
        const podArchiveFilename = `${path.basename(path.dirname(dto.path))}_${this.getTimestampForFilename()}.pod`
        const outputPath = path.join(dto.outputPath??dto.path, podArchiveFilename)
        await this.archive(outputPath, records)
    }
}