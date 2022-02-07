import { Command, Flags } from "@oclif/core";
import { CompositionInputDto } from "../../services/compose/composition-input.dto";
import { TYPES } from "../../types";
import { container } from "../../container";
import { ICompositionService } from "../../services/compose/composition-service.interface";

export default class Compose extends Command {

    static description = 'Compose a Pod (Generate .pod file).'

    static flags = {
        exclude: Flags.string({ char: 'e', description: '', multiple: true, default: [] }),
    }

    static args = [{ name: 'path', description: 'Path to pod folder', required: true }]

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Compose)
        const path: string = args.path
        const exclude: string[] = flags.exclude
        const dto = new CompositionInputDto(path, { exclude })
        const compositionService = container.get<ICompositionService>(TYPES.CompositionService)
        await compositionService.compose(dto)
    }
}