export class CleanInputDto {
    public constructor(
        public path: string,
        public exclude: string[],
        public excludePodFile: boolean
    ) { }
}