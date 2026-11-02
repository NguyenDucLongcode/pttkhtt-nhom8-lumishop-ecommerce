import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request, Response } from 'express';

export interface ResponseFormat<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> | Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    // Bỏ qua transform cho SSE endpoint — để Observable<MessageEvent> đi qua nguyên vẹn
    const accept = request?.headers?.accept || '';
    if (accept.includes('text/event-stream')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        code: response?.statusCode ?? 200,
        message: 'Success',
        data,
        timestamp: new Date().toISOString(),
        path: request?.url ?? '',
      })),
    );
  }
}
