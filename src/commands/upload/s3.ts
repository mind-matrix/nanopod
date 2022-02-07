import { Command, Flags } from '@oclif/core'
import * as dotenv from "dotenv"
import * as AWS from "aws-sdk"
import { glob } from "glob"
import * as path from "path"
import * as fs from "fs"
import * as unzipper from "unzipper"

dotenv.config()

export default class UploadS3 extends Command {
  static description = 'Upload a Pod to an S3 Bucket.'

  static flags = {
    bucket: Flags.string({ char: 'b', description: 'S3 Bucket Name', required: true }),
    accessKeyId: Flags.string({ char: 'i', description: 'S3 Access Key ID', required: false }),
    secretAccessKey: Flags.string({ char: 'k', description: 'S3 Secret Access Key', required: false })
  }

  static args = [{ name: 'path', description: 'Path to pod folder', required: true }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(UploadS3)
    const folderPath: string = args.path
    const bucket: string = flags.bucket
    const accessKeyId: string | undefined = flags.accessKeyId ?? process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey: string | undefined = flags.secretAccessKey ?? process.env.AWS_SECRET_ACCESS_KEY
    if (!accessKeyId || !secretAccessKey) {
      throw new Error("Invalid AWS Credentials. Please ensure you are using the correct credentials.")
    }
    const podArchivePaths = glob.sync(path.join(folderPath, "*.pod")).sort().reverse()
    if (podArchivePaths.length === 0) {
      throw new Error(`No pod archives found. Please run 'nanopod build "${folderPath}" before publishing.'`)
    }
    const podArchivePath = podArchivePaths[0]
    const s3 = new AWS.S3({
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    })
    fs.createReadStream(podArchivePath)
      .pipe(unzipper.Parse())
      .on('entry', function (entry) {
        const fileName = entry.path
        if (fileName !== '.pod') {
          const params = {
            Bucket: bucket,
            Key: fileName,
            Body: entry
          }
          s3.upload(params).promise()
        } else {
          entry.autodrain()
        }
      })
  }
}
