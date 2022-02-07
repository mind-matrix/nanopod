export class PublishInputDto {
    public constructor(
        public path: string,
        public registryUrl: string,
        public config: any
    ) { }
}