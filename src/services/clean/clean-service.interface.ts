import { CleanInputDto } from "./clean-input.dto";

export interface ICleanService {
    clean(dto: CleanInputDto): Promise<void>
}