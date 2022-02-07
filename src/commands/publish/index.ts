import { Command, Flags } from '@oclif/core'
import axios from "axios"
import { glob } from "glob"
import * as path from "path"
import * as fs from "fs"
import * as unzipper from "unzipper"
import * as etl from "etl"
import { container } from '../../container'
import { IPodParser } from '../../shared/pod-parser/pod-parser.interface'
import { TYPES } from '../../types'
import { IPodRecord } from '../../shared/pod-parser/pod-record.interface'
import * as dotenv from "dotenv"

dotenv.config()

export default class Publish extends Command {
    static description = 'Publish a Pod to a Registry'

    static flags = {
        config: Flags.string({ char: 'c', description: 'HTTP Request Configuration', default: '{}' })
    }

    static args = [
        { name: 'path', description: 'Path to pod folder', required: true },
        { name: 'url', description: 'URL of Nanopod Registry', required: true }
    ]

    getRecordsFromLatestPodArchive(dir: string): Promise<IPodRecord[]> {
        return new Promise((resolve, reject) => {
            const podArchivePathList = glob.sync(path.join(dir, "*.pod")).sort().reverse()
            if (podArchivePathList.length < 1) {
                const errorMessage = `No Pod Archives found in "${dir}". Please run 'nanopod build "${dir}"' before publishing.`
                this.error(errorMessage)
            } else {
                const latestPodArchivePath = podArchivePathList[0]
                this.debug(`Publishing from ${latestPodArchivePath}`)
                fs.createReadStream(latestPodArchivePath)
                    .pipe(unzipper.Parse())
                    .pipe(etl.map(async entry => {
                        if (entry.path == ".pod") {
                            const content = (await entry.buffer()).toString()
                            const podParser = container.get<IPodParser>(TYPES.PodParser)
                            const records = await podParser.parse(content)
                            resolve(records)
                        }
                        else {
                            entry.autodrain()
                        }
                    }))
            }
        })

    }

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Publish)
        const path: string = args.path
        const url: string = args.url
        const config: { [k: string]: string } = JSON.parse(flags.config)
        const data = await this.getRecordsFromLatestPodArchive(path)
        this.debug("Data Sent: " + JSON.stringify(data))
        const response = await axios.request({
            ...config,
            url: url,
            data: data
        })
        if (response.status == 200) {
            this.debug("Response Data: " + response.data)
        } else {
            this.debug(`E: ${response.statusText} (${response.status})`)
            this.debug("Response Data: " + response.data)
        }
    }
}