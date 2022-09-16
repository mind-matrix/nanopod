import { Command, Flags } from "@oclif/core";
import { TYPES } from "../../types";
import { container } from "../../container";
import { BuildInputDto } from "../../services/build/build-input.dto";
import { IBuildService } from "../../services/build/build-service.interface";

export default class Build extends Command {

    static description = 'Build a Pod Archive.'

    static flags = {
        output: Flags.string({ char: 'o', description: 'Output path for Pod archive', required: false }),
    }

    static args = [{ name: 'path', description: 'Path to pod folder', required: true }]

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Build)
        const path: string = args.path.replace(/\\/g, '/')
        const outputPath: string | undefined = flags.output?.replace(/\\/g, '/')
        const dto = new BuildInputDto(path, outputPath)
        const buildService = container.get<IBuildService>(TYPES.BuildService)
        await buildService.build(dto)
    }
}