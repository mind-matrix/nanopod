import { PublishInputDto } from "./publish-input.dto";

export interface IPublishService {
    publish(dto: PublishInputDto): Promise<void>
}