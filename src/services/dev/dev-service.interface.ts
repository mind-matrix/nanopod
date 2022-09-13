import { DevInputDto } from "./dev-input.dto";

export interface IDevService {
    dev(dto: DevInputDto): Promise<void>
}