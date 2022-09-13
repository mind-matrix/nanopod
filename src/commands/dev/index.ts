import {Command, Flags} from '@oclif/core'
import { container } from '../../container'
import { DevInputDto } from '../../services/dev/dev-input.dto'
import { IDevService } from '../../services/dev/dev-service.interface'
import { TYPES } from '../../types'

export default class Dev extends Command {
  static description = 'Start Development Server'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    port: Flags.integer({ char: 'p', description: 'HTTP Port', default: 8000 }),
    cachedir: Flags.string({ char: 'd', description: 'Caching directory for pod files', default: '.cache' })
  }
  
  static strict = false

  public async run(): Promise<void> {
    const { argv, flags } = await this.parse(Dev)
    const patterns: string[] = argv
    const port: number | undefined = flags.port
    const cachedir: string | undefined = flags.cachedir
    const dto = new DevInputDto(patterns, port, cachedir)
    const devService = container.get<IDevService>(TYPES.DevService)
    await devService.dev(dto)
  }
}
