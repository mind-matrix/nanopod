import { IComposeConfig } from "./compose-config.interface";

export class CompositionInputDto {
    public constructor(
        public path: string,
        public config: IComposeConfig
    ) {}
}