import { inject, injectable } from "inversify";
import { PublishInputDto } from "../services/publish/publish-input.dto";
import { IPublishService } from "../services/publish/publish-service.interface";
import { TYPES } from "../types";

@injectable()
export class Publisher {

    @inject(TYPES.PublishService) private publishService: IPublishService

    async publish(path: string, registryUrl: string, config: any = {}) {
        await this.publishService.publish(new PublishInputDto(path, registryUrl, config))
    }

}