import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';

@Injectable()
export class DbService {
  private readonly logger = new Logger(DbService.name);
  private readonly dataDir: string;

  constructor() {
    // Tìm thư mục data ưu tiên: src/data (dev) → dist/src/data (prod)
    const srcDataDir = path.resolve(process.cwd(), 'src', 'data');
    const distDataDir = path.resolve(process.cwd(), 'dist', 'src', 'data');

    if (existsSync(srcDataDir)) {
      this.dataDir = srcDataDir;
    } else if (existsSync(distDataDir)) {
      this.dataDir = distDataDir;
    } else {
      // Fallback: tạo mới trong src/data
      this.dataDir = srcDataDir;
    }

    this.logger.log(`📁 Data directory: ${this.dataDir}`);
  }

  private getFilePath(collection: string): string {
    return path.join(this.dataDir, `db.${collection}.json`);
  }

  async getData<T = any>(collection: string): Promise<T[]> {
    const filePath = this.getFilePath(collection);

    if (!existsSync(filePath)) {
      this.logger.warn(`File không tồn tại: ${filePath} → trả về mảng rỗng`);
      return [];
    }

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      return raw.trim() ? (JSON.parse(raw) as T[]) : [];
    } catch (error) {
      this.logger.error(`Lỗi khi đọc collection "${collection}" từ ${filePath}:`, error);
      return [];
    }
  }

  async saveData(collection: string, data: any[]): Promise<void> {
    const filePath = this.getFilePath(collection);

    try {
      // Tạo thư mục nếu chưa tồn tại
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      this.logger.error(`Lỗi khi ghi collection "${collection}" vào ${filePath}:`, error);
      throw error;
    }
  }
}
