import { container } from "./container"
import { Builder } from "./modules/builder"
import { Cleaner } from "./modules/cleaner"
import { Composer } from "./modules/composer"
import { Dev } from "./modules/dev"
import { Publisher } from "./modules/publisher"
import { RegistryService } from "./services/registry/registry.service"
import { PodParser } from "./shared/pod-parser/pod-parser.service"
export {run} from '@oclif/core'

export default {
    Composer: container.get(Composer),
    Builder: container.get(Builder),
    Publisher: container.get(Publisher),
    Cleaner: container.get(Cleaner),
    Dev: container.get(Dev),
    PodParser: container.get(PodParser),
    Registry: container.get(RegistryService)
}

export { ICacheService } from './services/registry/cache-service.interface'