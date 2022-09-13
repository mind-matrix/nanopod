export class DevInputDto {
    public constructor(
        public patterns: string[],
        public port: number | undefined,
        public cachedir: string | undefined
    ) { }
}