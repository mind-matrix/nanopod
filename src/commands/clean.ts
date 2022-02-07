import { Command, Flags } from "@oclif/core";
import { CompositionInputDto } from "../services/compose/composition-input.dto";
import { TYPES } from "../types";
import { container } from "../container";
import { ICompositionService } from "../services/compose/composition-service.interface";
import { CleanInputDto } from "../services/clean/clean-input.dto";
import { ICleanService } from "../services/clean/clean-service.interface";

export default class Clean extends Command {

    static description = 'Clean all nanopod resources (Remove files matching .pod and *.pod pattern)'

    static flags = {
        exclude: Flags.string({ char: 'e', description: 'Exclude files matching pattern', multiple: true, default: [] }),
        excludePodFile: Flags.boolean({ char: 'd', description: 'Exclude pod files', default: false })
    }

    static args = [{ name: 'path', description: 'Path to pod folder', required: true }]

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Clean)
        const path: string = args.path
        const exclude: string[] = flags.exclude
        const excludePodFile: boolean = flags.excludePodFile
        const dto = new CleanInputDto(path, exclude, excludePodFile)
        const cleanService = container.get<ICleanService>(TYPES.CleanService)
        await cleanService.clean(dto)
    }
}