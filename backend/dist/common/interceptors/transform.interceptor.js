var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, } from '@nestjs/common';
import { map } from 'rxjs/operators';
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        const http = context.switchToHttp();
        const request = http.getRequest();
        const response = http.getResponse();
        const accept = request?.headers?.accept || '';
        if (accept.includes('text/event-stream')) {
            return next.handle();
        }
        return next.handle().pipe(map((data) => ({
            code: response?.statusCode ?? 200,
            message: 'Success',
            data,
            timestamp: new Date().toISOString(),
            path: request?.url ?? '',
        })));
    }
};
TransformInterceptor = __decorate([
    Injectable()
], TransformInterceptor);
export { TransformInterceptor };
//# sourceMappingURL=transform.interceptor.js.map