import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new TransformInterceptor());
    const config = new DocumentBuilder()
        .setTitle('LumiShop API')
        .setDescription('Tài liệu API hệ thống LumiShop - Tích hợp AI Chatbot')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT access token vào đây',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Auth', 'Xác thực và phân quyền người dùng (Register, Login, Refresh, Logout)')
        .addTag('products', 'Quản lý sản phẩm LumiShop')
        .addTag('Categories', 'Quản lý danh mục sản phẩm LumiShop')
        .addTag('Customers', 'Quản lý khách hàng LumiShop')
        .addTag('Vouchers', 'Quản lý mã giảm giá (Vouchers) LumiShop')
        .addTag('Orders', 'Quản lý đơn hàng (Orders) và Checkout')
        .addTag('Chatbot', 'Tư vấn thông minh qua AI Chatbot (Ollama qwen3:4b)')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT ?? 8080;
    await app.listen(port);
    console.log(`\n🚀 Server đang chạy tại: http://localhost:${port}`);
    console.log(`📖 Swagger API Docs: http://localhost:${port}/api/docs\n`);
}
await bootstrap();
//# sourceMappingURL=main.js.map