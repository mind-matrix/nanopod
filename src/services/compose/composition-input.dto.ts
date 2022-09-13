import { IComposeConfig } from "./compose-config.interface";

export class CompositionInputDto {
    public constructor(
        public name: string | undefined,
        public path: string,
        public config: IComposeConfig
    ) {}
}