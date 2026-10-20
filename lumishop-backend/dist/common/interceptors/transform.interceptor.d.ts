import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ResponseFormat<T> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
    path: string;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> | Observable<any>;
}
