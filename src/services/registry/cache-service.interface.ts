import { Readable } from "stream";

export interface ICacheService {
    cache(hash: string, stream: Readable): Promise<void>
    retrieve(hash: string): Promise<Readable>
}