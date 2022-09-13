import { inject, injectable } from "inversify";
import { IComposeConfig } from "../services/compose/compose-config.interface";
import { CompositionInputDto } from "../services/compose/composition-input.dto";
import { ICompositionService } from "../services/compose/composition-service.interface";
import { TYPES } from "../types";

@injectable()
export class Composer {

    @inject(TYPES.CompositionService) private compositionService: ICompositionService
    
    async compose(name: string | undefined, path: string, config: IComposeConfig = { exclude: [] }) {
        await this.compositionService.compose(new CompositionInputDto(name, path, config))
    }
}