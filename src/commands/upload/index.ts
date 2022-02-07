import { Command, Flags } from '@oclif/core'

export default class Upload extends Command {
  static description = 'Upload a Pod to a Storage Provider.'

  async run(): Promise<void> {
    this.log(`Please use a specific command based on the storage provider of your choice.`)
  }
}