import { inject, injectable } from "inversify";
import { PublishInputDto } from "./publish-input.dto";
import { IPublishService } from "./publish-service.interface";
import * as fs from "fs";
import { glob } from "glob";
import * as path from "path/posix";
import * as unzipper from "unzipper";
import * as etl from "etl";
import { TYPES } from "../../types";
import { PodParser } from "../../shared/pod-parser/pod-parser.service";
import { IPodRecord } from "../../shared/pod-parser/pod-record.interface";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config()

@injectable()
export class PublishService implements IPublishService {

    @inject(TYPES.PodParser) private podParser: PodParser

    private getRecordsFromLatestPodArchive(dir: string): Promise<IPodRecord[]> {
        return new Promise((resolve, reject) => {
            const podArchivePathList = glob.sync(path.join(dir, "*.pod")).sort().reverse()
            if (podArchivePathList.length < 1) {
                const errorMessage = `No Pod Archives found in "${dir}". Please run 'nanopod build "${dir}"' before publishing.`
                throw new Error(errorMessage)
            } else {
                const latestPodArchivePath = podArchivePathList[0]
                fs.createReadStream(latestPodArchivePath)
                    .pipe(unzipper.Parse())
                    .pipe(etl.map(async entry => {
                        if (entry.path == ".pod") {
                            const content = (await entry.buffer()).toString()
                            const records = await this.podParser.parse(content)
                            resolve(records)
                        }
                        else {
                            entry.autodrain()
                        }
                    }))
            }
        })
    }
    
    async publish(dto: PublishInputDto): Promise<void> {
        const data = await this.getRecordsFromLatestPodArchive(dto.path)
        const response = await axios.request({
            ...dto.config,
            url: dto.registryUrl,
            data: data
        })
        if (response.status == 200) {
            // do nothing
        } else {
            throw new Error(`E: ${response.statusText} (${response.status})`)
        }
    }
}