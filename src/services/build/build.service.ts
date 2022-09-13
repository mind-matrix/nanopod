import { inject, injectable } from "inversify";
import { PodParser } from "../../shared/pod-parser/pod-parser.service";
import { IPodRecord } from "../../shared/pod-parser/pod-record.interface";
import { TYPES } from "../../types";
import { BuildInputDto } from "./build-input.dto";
import { IBuildService } from "./build-service.interface";
import * as fs from "fs";
import * as archiver from "archiver";
import * as uniqid from "uniqid";
import { HtmlParser } from "../../shared/html-parser/html-parser.service";
import { CssParser } from "../../shared/css-parser/css-parser.service";
import { extname, relative, join, basename, dirname } from "path/posix";
import { JsParser } from "../../shared/js-parser/js-parser.service";

@injectable()
export class BuildService implements IBuildService {

    @inject(TYPES.PodParser) private podParser: PodParser
    @inject(TYPES.HtmlParser) private htmlParser: HtmlParser
    @inject(TYPES.CssParser) private cssParser: CssParser
    @inject(TYPES.JsParser) private jsParser: JsParser

    archive(scopeId: string, inputPath: string, outputPath: string, records: IPodRecord[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const tmpdir = fs.mkdtempSync(`np-${scopeId}-`)
            const output = fs.createWriteStream(outputPath)
            const archive = archiver('zip', {
                zlib: { level: 9 }
            })
            output.on('close', function () {
                fs.rmSync(tmpdir, { recursive: true, force: true })
                resolve()
            })
            output.on('end', function () {
                fs.rmSync(tmpdir, { recursive: true, force: true })
                resolve()
            })
            archive.on('warning', function (err) {
                if (err.code === 'ENOENT') {
                    console.log(`Warning: ${err.message}`)
                } else {
                    fs.rmSync(tmpdir, { recursive: true, force: true })
                    reject(err)
                }
            })
            archive.on('error', function (err) {
                fs.rmSync(tmpdir, { recursive: true, force: true })
                reject(err)
            })
            archive.pipe(output)
            archive.append(await this.podParser.unparse(records), { name: ".pod" })
            const relativeRecords = records.map(record => ({ path: relative(inputPath, record.path), hash: record.hash }))
            for (const record of records) {
                const sourceFileExtension = extname(record.path)
                if ([".html",".htm"].includes(sourceFileExtension)) {
                    const source = fs.readFileSync(record.path, "utf-8")
                    const compiled = await this.htmlParser.parse(source, scopeId, relativeRecords)
                    const tmpfile = join(tmpdir, record.hash)
                    fs.writeFileSync(tmpfile, compiled)
                    archive.append(fs.createReadStream(tmpfile), { name: record.hash })
                } else if ([".css"].includes(sourceFileExtension)) {
                    const source = fs.readFileSync(record.path, "utf-8")
                    const compiled = await this.cssParser.parse(source, scopeId, relativeRecords)
                    const tmpfile = join(tmpdir, record.hash)
                    fs.writeFileSync(tmpfile, compiled)
                    archive.append(fs.createReadStream(tmpfile), { name: record.hash })
                } else if ([".js"].includes(sourceFileExtension)) {
                    const source = fs.readFileSync(record.path, "utf-8")
                    const compiled = await this.jsParser.parse(source, scopeId, relativeRecords)
                    const tmpfile = join(tmpdir, record.hash)
                    fs.writeFileSync(tmpfile, compiled)
                    archive.append(fs.createReadStream(tmpfile), { name: record.hash })
                } else {
                    archive.append(fs.createReadStream(record.path), { name: record.hash })
                }
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
        const podFilePath = join(dto.path, ".pod")
        if (!fs.existsSync(podFilePath)) {
            throw new Error(`No pod file(s) found. Please run 'nanopod compose "${dto.path}"' before build.`)
        }
        const records = await this.podParser.parse(fs.readFileSync(podFilePath).toString())
        const defaultPodArchiveFilename = `${basename(dirname(dto.path))}_${this.getTimestampForFilename()}.pod`
        const outputPath = dto.outputPath??join(dto.path, defaultPodArchiveFilename)
        const scopeId = uniqid("xpod_")
        await this.archive(scopeId, dto.path, outputPath, records)
    }
}