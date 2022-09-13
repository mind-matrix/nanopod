import { Readable } from "stream"
import { ICacheService } from "./cache-service.interface"

export interface IRegistryService {
    upload(stream: Readable, primaryPath: string, cache: ICacheService): Promise<string>
    download(hash: string, cache: ICacheService): Promise<Readable>
}