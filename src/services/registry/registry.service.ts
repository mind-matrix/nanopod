import { Readable } from "stream";
import { IPodRecord } from "../../shared/pod-parser/pod-record.interface";
import { ICacheService } from "./cache-service.interface";
import { IRegistryService } from "./registry-service.interface";
import { Parse } from "unzipper";
import { createReadStream, createWriteStream, mkdtempSync } from "fs";
import * as http from "http";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { PodParser } from "../../shared/pod-parser/pod-parser.service";
import * as path from "path/posix";

@injectable()
export class RegistryService implements IRegistryService {
    
    @inject(TYPES.PodParser) private podParser: PodParser
    
    private async parse(stream: Readable) {
        const tmpdir = mkdtempSync("np-tmp")
        const archive = stream.pipe(Parse({ forceStream: true }))
        let records: IPodRecord[]
        for await (const entry of archive) {
            if (entry.path == ".pod") {
                const data = (<Buffer>await entry.buffer()).toString("utf-8")
                records = await this.podParser.parse(data)
                entry.autodrain()
            } else {
                entry.pipe(createWriteStream(path.join(tmpdir, entry.path)))
            }
        }
        return records.map(record => ({ path: record.hash, hash: record.hash, stream: createReadStream(path.join(tmpdir, record.path)) }))
    }

    async upload(stream: Readable, primaryPath: string, cache: ICacheService) {
        let primaryHash: string | null = null
        const records = await this.parse(stream)
        for (const record of records) {
            if (record.path.trim() == primaryPath.trim()) {
                primaryHash = record.hash
            }
            cache.cache(record.hash, record.stream)
        }
        if (primaryHash === null) {
            throw new Error('invalid primary path for given pod')
        }
        return primaryHash
    }

    async download(hash: string, cache: ICacheService) {
        return await cache.retrieve(hash)
    }
    
}