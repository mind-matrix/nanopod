import { inject, injectable } from "inversify";
import { PodParser } from "../../shared/pod-parser/pod-parser.service";
import { TYPES } from "../../types";
import { IDevService } from "./dev-service.interface";
import { DevInputDto } from "./dev-input.dto";
import { glob } from "glob";
import { Parse } from "unzipper";
import * as fs from "fs";
import { IPodRecord } from "../../shared/pod-parser/pod-record.interface";
import { basename, extname, join } from "path/posix";
import fastify from "fastify";
import * as mime from "mime";
import { prompt } from "enquirer";

@injectable()
export class DevService implements IDevService {

    @inject(TYPES.PodParser) private podParser: PodParser

    getTimestampForFilename() {
        return new Date().toISOString()
                        .replace(/T/, ' ')
                        .replace(/\..+/, '')
                        .replace(/[-\:\s]/g, '_')
    }

    async parse(path: string, cachedir: string): Promise<{ name: string, path: string, records: IPodRecord[] }> {
        let records: IPodRecord[]
        const name = basename(path, extname(path))
        const zip = fs.createReadStream(path).pipe(Parse({ forceStream: true }))
        for await (const entry of zip) {
            if (entry.path == ".pod") {
                const data = (<Buffer>await entry.buffer()).toString("utf-8")
                records = await this.podParser.parse(data)
                entry.autodrain()
            } else {
                entry.pipe(fs.createWriteStream(join(cachedir, entry.path)))
            }
        }
        return { name, path, records }
    }

    async getPrimary(path: string, records: IPodRecord[]): Promise<IPodRecord> {
        const name = basename(path, extname(path))
        const recordsWithName = records.filter(record => basename(record.path, extname(record.path)) == name)
        const indexHtmlRecords = records.filter(record => ["index.html","index.htm"].includes(basename(record.path)))
        if (recordsWithName.length) {
            const firstHtmlRecordWithName = recordsWithName.find(record => [".html",".htm"].includes(extname(record.path)))
            if (firstHtmlRecordWithName) {
                return firstHtmlRecordWithName
            }
        } else if (indexHtmlRecords.length) {
            return indexHtmlRecords[0]
        }
        const { choice } = await prompt([{
            type: 'select',
            name: 'choice',
            message: `select a file as the primary source for ${path}`,
            choices: records.map(record => ({ name: record.path }))
        }]) as { choice: string }
        return records.find(record => record.path == choice)
    }

    async dev(dto: DevInputDto): Promise<void> {
        if (!fs.existsSync(dto.cachedir)) {
            fs.mkdirSync(dto.cachedir, { recursive: true })
        }
        const archives = dto.patterns.map(pattern => glob.sync(pattern)).flat()
        const pods = await Promise.all(archives.map(async pod => await this.parse(pod, dto.cachedir)))
        const server = fastify({ logger: true })
        for (const pod of pods) {
            const primary = await this.getPrimary(pod.path, pod.records)
            console.log(`[registering endpoint] /${pod.name}`)
            server.get(`/${pod.name}`, (_, res) => {
                const ext = extname(primary.path)
                const type = mime.getType(ext)
                const stream = fs.createReadStream(join(dto.cachedir, primary.hash))
                res.type(type).code(200).send(stream)
            })
        }
        server.get("/resources/:file", async function (req, res) {
            const { file } = req.params as { file: string }
            const ext = extname(file)
            const hash = basename(file, ext)
            const type = mime.getType(ext)
            const stream = fs.createReadStream(join(dto.cachedir, hash))
            res.type(type).code(200).send(stream)
        })
        try {
            await server.listen({ port: dto.port })
        } catch (e) {
            server.log.error(e)
            process.exit(1)
        }
    }
}