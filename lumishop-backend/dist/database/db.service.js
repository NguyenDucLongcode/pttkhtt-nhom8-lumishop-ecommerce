var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DbService_1;
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
let DbService = DbService_1 = class DbService {
    logger = new Logger(DbService_1.name);
    dataDir;
    constructor() {
        const srcDataDir = path.resolve(process.cwd(), 'src', 'data');
        const distDataDir = path.resolve(process.cwd(), 'dist', 'src', 'data');
        if (existsSync(srcDataDir)) {
            this.dataDir = srcDataDir;
        }
        else if (existsSync(distDataDir)) {
            this.dataDir = distDataDir;
        }
        else {
            this.dataDir = srcDataDir;
        }
        this.logger.log(`📁 Data directory: ${this.dataDir}`);
    }
    getFilePath(collection) {
        return path.join(this.dataDir, `db.${collection}.json`);
    }
    async getData(collection) {
        const filePath = this.getFilePath(collection);
        if (!existsSync(filePath)) {
            this.logger.warn(`File không tồn tại: ${filePath} → trả về mảng rỗng`);
            return [];
        }
        try {
            const raw = await fs.readFile(filePath, 'utf-8');
            return raw.trim() ? JSON.parse(raw) : [];
        }
        catch (error) {
            this.logger.error(`Lỗi khi đọc collection "${collection}" từ ${filePath}:`, error);
            return [];
        }
    }
    async saveData(collection, data) {
        const filePath = this.getFilePath(collection);
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        }
        catch (error) {
            this.logger.error(`Lỗi khi ghi collection "${collection}" vào ${filePath}:`, error);
            throw error;
        }
    }
};
DbService = DbService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], DbService);
export { DbService };
//# sourceMappingURL=db.service.js.map