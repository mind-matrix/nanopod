export class BuildInputDto {
    public constructor(
        public path: string,
        public outputPath: string | undefined
    ) { }
}