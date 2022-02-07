import { Command, Flags } from '@oclif/core'
import { container } from '../../container'
import { PublishInputDto } from '../../services/publish/publish-input.dto'
import { IPublishService } from '../../services/publish/publish-service.interface'
import { TYPES } from '../../types'

export default class Publish extends Command {
    static description = 'Publish a Pod to a Registry.'

    static flags = {
        config: Flags.string({ char: 'c', description: 'HTTP Request Configuration', default: '{}' })
    }

    static args = [
        { name: 'path', description: 'Path to pod folder', required: true },
        { name: 'url', description: 'URL of Nanopod Registry', required: true }
    ]

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Publish)
        const path: string = args.path
        const url: string = args.url
        const config = JSON.parse(flags.config)
        const publishService = container.get<IPublishService>(TYPES.PublishService)
        const dto = new PublishInputDto(path, url, config)
        await publishService.publish(dto)
    }
}