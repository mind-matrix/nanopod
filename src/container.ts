import "reflect-metadata";
import { Container } from "inversify";
import { ICompositionService } from "./services/compose/composition-service.interface";
import { CompositionService } from "./services/compose/composition.service";
import { TYPES } from "./types";
import { IPodParser } from "./shared/pod-parser/pod-parser.interface";
import { PodParser } from "./shared/pod-parser/pod-parser.service";
import { IBuildService } from "./services/build/build-service.interface";
import { BuildService } from "./services/build/build.service";
import { ICleanService } from "./services/clean/clean-service.interface";
import { CleanService } from "./services/clean/clean.service";
import { IPublishService } from "./services/publish/publish-service.interface";
import { PublishService } from "./services/publish/publish.service";

const container = new Container()

container.bind<IPodParser>(TYPES.PodParser).to(PodParser)
container.bind<ICompositionService>(TYPES.CompositionService).to(CompositionService)
container.bind<IBuildService>(TYPES.BuildService).to(BuildService)
container.bind<IPublishService>(TYPES.PublishService).to(PublishService)
container.bind<ICleanService>(TYPES.CleanService).to(CleanService)

export { container }