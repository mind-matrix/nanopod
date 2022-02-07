import { BuildInputDto } from "./build-input.dto";

export interface IBuildService {
    build(dto: BuildInputDto): Promise<void>
}