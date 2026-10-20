export declare class DbService {
    private readonly logger;
    private readonly dataDir;
    constructor();
    private getFilePath;
    getData<T = any>(collection: string): Promise<T[]>;
    saveData(collection: string, data: any[]): Promise<void>;
}
