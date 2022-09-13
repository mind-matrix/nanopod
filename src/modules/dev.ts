import { inject, injectable } from "inversify"
import { DevInputDto as DevInputDto } from "../services/dev/dev-input.dto"
import { IDevService } from "../services/dev/dev-service.interface"
import { TYPES } from "../types"

@injectable()
export class Dev {

    @inject(TYPES.DevService) private devService: IDevService

    tryParseEnvPort(port?: string) {
        if (port) {
            try {
                return parseInt(port)
            } catch (e) {
                return null
            }
        }
        return null
    }
    
    async dev(path: string[], port: number | undefined, cachedir: string | undefined) {
        await this.devService.dev(new DevInputDto(path, port??this.tryParseEnvPort(process.env['PORT'])??8000, cachedir))
    }
}