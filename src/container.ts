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

const container = new Container()

container.bind<IPodParser>(TYPES.PodParser).to(PodParser)
container.bind<ICompositionService>(TYPES.CompositionService).to(CompositionService)
container.bind<IBuildService>(TYPES.BuildService).to(BuildService)
container.bind<ICleanService>(TYPES.CleanService).to(CleanService)

export { container }