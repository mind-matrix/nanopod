import { container } from "./container"
import { Builder } from "./modules/builder"
import { Cleaner } from "./modules/cleaner"
import { Composer } from "./modules/composer"
import { Publisher } from "./modules/publisher"
import { PodParser } from "./shared/pod-parser/pod-parser.service"
export {run} from '@oclif/core'

export default {
    Composer: container.get(Composer),
    Builder: container.get(Builder),
    Publisher: container.get(Publisher),
    Cleaner: container.get(Cleaner),
    PodParser: container.get(PodParser)
}