import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor.js';

describe('VouchersController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /vouchers - Phân trang & Lọc', () => {
    it('Trang 1: lấy 10 voucher đầu tiên', async () => {
      const response = await request(app.getHttpServer())
        .get('/vouchers?page=1&limit=10')
        .expect(200);

      const body = response.body;
      expect(body.code).toBe(200);
      expect(body.data).toBeDefined();
      expect(body.data.page).toBe(1);
      expect(body.data.limit).toBe(10);
      expect(body.data.total).toBeGreaterThanOrEqual(15);
      expect(body.data.data).toHaveLength(10);
    });

    it('Trang 2: lấy các voucher còn lại (limit 10)', async () => {
      const response = await request(app.getHttpServer())
        .get('/vouchers?page=2&limit=10')
        .expect(200);

      const body = response.body;
      expect(body.code).toBe(200);
      expect(body.data.page).toBe(2);
      expect(body.data.limit).toBe(10);
      expect(body.data.data.length).toBeGreaterThanOrEqual(5);
    });

    it('Kiểm tra không trùng lặp ID giữa Trang 1 và Trang 2', async () => {
      const page1Res = await request(app.getHttpServer())
        .get('/vouchers?page=1&limit=10')
        .expect(200);

      const page2Res = await request(app.getHttpServer())
        .get('/vouchers?page=2&limit=10')
        .expect(200);

      const page1Ids = page1Res.body.data.data.map((v: any) => v.id);
      const page2Ids = page2Res.body.data.data.map((v: any) => v.id);

      const duplicates = page1Ids.filter((id: string) => page2Ids.includes(id));
      expect(duplicates).toHaveLength(0);
    });

    it('Lọc theo isActive=true', async () => {
      const response = await request(app.getHttpServer())
        .get('/vouchers?isActive=true&limit=50')
        .expect(200);

      const vouchers = response.body.data.data;
      expect(vouchers.every((v: any) => v.isActive === true)).toBe(true);
    });

    it('Lọc tìm kiếm gần đúng theo mã code (code=LUMI)', async () => {
      const response = await request(app.getHttpServer())
        .get('/vouchers?code=LUMI&limit=50')
        .expect(200);

      const vouchers = response.body.data.data;
      expect(vouchers.length).toBeGreaterThan(0);
      expect(vouchers.every((v: any) => v.code.toUpperCase().includes('LUMI'))).toBe(true);
    });
  });

  describe('GET /vouchers/check/:code - Kiểm tra mã giảm giá', () => {
    it('Trả về hợp lệ cho mã đang hoạt động (LUMI10)', async () => {
      const response = await request(app.getHttpServer())
        .get('/vouchers/check/LUMI10')
        .expect(200);

      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.voucher.code).toBe('LUMI10');
    });

    it('Báo không hợp lệ cho mã đã hết hạn hoặc ngưng sử dụng (LUMIDISABLED)', async () => {
      const response = await request(app.getHttpServer())
        .get('/vouchers/check/LUMIDISABLED')
        .expect(200);

      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.message).toContain('ngưng áp dụng');
    });

    it('Trả về 404 cho mã không tồn tại', async () => {
      await request(app.getHttpServer())
        .get('/vouchers/check/KHONGTONTAI123')
        .expect(404);
    });
  });

  describe('GET /vouchers/:id - Chi tiết voucher', () => {
    it('Lấy thông tin voucher hợp lệ', async () => {
      const response = await request(app.getHttpServer())
        .get('/vouchers/VC001')
        .expect(200);

      expect(response.body.data.id).toBe('VC001');
      expect(response.body.data.code).toBe('LUMI10');
    });

    it('Trả về 404 cho ID không tồn tại', async () => {
      await request(app.getHttpServer())
        .get('/vouchers/VC_KHONG_CO')
        .expect(404);
    });
  });
});
