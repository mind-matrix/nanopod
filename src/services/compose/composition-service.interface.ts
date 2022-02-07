import { CompositionInputDto } from "./composition-input.dto";

export interface ICompositionService {
    compose(dto: CompositionInputDto): Promise<void>
}