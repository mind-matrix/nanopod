import { Command, Flags } from "@oclif/core";
import { CompositionInputDto } from "../../services/compose/composition-input.dto";
import { TYPES } from "../../types";
import { container } from "../../container";
import { ICompositionService } from "../../services/compose/composition-service.interface";

export default class Compose extends Command {

    static description = 'Compose a Pod (Generate .pod file).'

    static flags = {
        exclude: Flags.string({ char: 'e', description: 'Exclude files', multiple: true, default: [] }),
        name: Flags.string({ char: 'n', description: 'Pod name' })
    }

    static args = [{ name: 'path', description: 'Path to pod folder', required: true }]

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Compose)
        const path: string = args.path
        const exclude: string[] = flags.exclude
        const name: string | undefined = flags.name
        const dto = new CompositionInputDto(name, path, { exclude })
        const compositionService = container.get<ICompositionService>(TYPES.CompositionService)
        await compositionService.compose(dto)
    }
}