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
import { Composer } from "./modules/composer";
import { Builder } from "./modules/builder";
import { Publisher } from "./modules/publisher";
import { IHtmlParser } from "./shared/html-parser/html-parser.interface";
import { HtmlParser } from "./shared/html-parser/html-parser.service";
import { CssParser } from "./shared/css-parser/css-parser.service";
import { ICssParser } from "./shared/css-parser/css-parser.interface";
import { IJsParser } from "./shared/js-parser/js-parser.interface";
import { JsParser } from "./shared/js-parser/js-parser.service";
import { IDevService } from "./services/dev/dev-service.interface";
import { DevService } from "./services/dev/dev.service";
import { IRegistryService } from "./services/registry/registry-service.interface";
import { RegistryService } from "./services/registry/registry.service";

const container = new Container()

container.bind<IPodParser>(TYPES.PodParser).to(PodParser)
container.bind<IHtmlParser>(TYPES.HtmlParser).to(HtmlParser)
container.bind<ICssParser>(TYPES.CssParser).to(CssParser)
container.bind<IJsParser>(TYPES.JsParser).to(JsParser)

container.bind<ICompositionService>(TYPES.CompositionService).to(CompositionService)
container.bind<IBuildService>(TYPES.BuildService).to(BuildService)
container.bind<IPublishService>(TYPES.PublishService).to(PublishService)
container.bind<ICleanService>(TYPES.CleanService).to(CleanService)
container.bind<IDevService>(TYPES.DevService).to(DevService)
container.bind<IRegistryService>(TYPES.RegistryService).to(RegistryService)

container.bind(PodParser).toSelf()
container.bind(HtmlParser).toSelf()
container.bind(CssParser).toSelf()
container.bind(JsParser).toSelf()

container.bind(Composer).toSelf()
container.bind(Builder).toSelf()
container.bind(Publisher).toSelf()
container.bind(DevService).toSelf()
container.bind(RegistryService).toSelf()

export { container }