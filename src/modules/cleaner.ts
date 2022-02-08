import { inject, injectable } from "inversify"
import { CleanInputDto } from "../services/clean/clean-input.dto"
import { ICleanService } from "../services/clean/clean-service.interface"
import { TYPES } from "../types"

@injectable()
export class Cleaner {

    @inject(TYPES.CleanService) private cleanService: ICleanService
    
    async clean(path: string, exclude: string[] = [], excludePodFile: boolean = false) {
        await this.cleanService.clean(new CleanInputDto(path, exclude, excludePodFile))
    }
}