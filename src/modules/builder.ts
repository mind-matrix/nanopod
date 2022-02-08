import { inject, injectable } from "inversify"
import { BuildInputDto } from "../services/build/build-input.dto"
import { IBuildService } from "../services/build/build-service.interface"
import { TYPES } from "../types"

@injectable()
export class Builder {

    @inject(TYPES.BuildService) private buildService: IBuildService
    
    async build(path: string, outputPath?: string) {
        await this.buildService.build(new BuildInputDto(path, outputPath??path))
    }
}