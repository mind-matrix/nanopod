import { Command, Flags } from "@oclif/core"
import Build from "./build"
import Compose from "./compose"
import Publish from "./publish"
import UploadS3 from "./upload/s3"
import * as dotenv from "dotenv"
import Clean from "./clean"

dotenv.config()

export default class Deploy extends Command {

    static description = 'End-to-end deployment of a Nanopod from a folder'

    static flags = {
        output: Flags.string({ char: 'o', description: 'Output path for Pod archive', required: false }),
        config: Flags.string({ char: 'c', description: 'HTTP Request Configuration', default: '{}' }),
        exclude: Flags.string({ char: 'e', description: 'Exclude files matching pattern', multiple: true, default: [] }),
        excludePodFile: Flags.boolean({ char: 'd', description: 'Exclude pod files', default: false }),
        bucket: Flags.string({ char: 'b', description: 'S3 Bucket Name', required: true }),
        accessKeyId: Flags.string({ char: 'i', description: 'S3 Access Key ID', required: false, default: process.env.AWS_ACCESS_KEY_ID }),
        secretAccessKey: Flags.string({ char: 'k', description: 'S3 Secret Access Key', required: false, default: process.env.AWS_SECRET_ACCESS_KEY })
    }

    static args = [
        { name: 'path', description: 'Path to pod folder', required: true },
        { name: 'url', description: 'URL of Nanopod Registry', required: true }
    ]

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Deploy)
        await Compose.run([ args.path, ...flags.exclude.map(e => ['-e', e]).flat() ])
        await Build.run([ args.path, '-o', flags.output??args.path ])
        await UploadS3.run([ args.path, '-b', flags.bucket, '-i', flags.accessKeyId, '-k', flags.secretAccessKey ])
        await Publish.run([ args.path, args.url, '-c', flags.config ])
        await Clean.run([ args.path, ...(flags.excludePodFile?['-d']:[]) ])
    }
}