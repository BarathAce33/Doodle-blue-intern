import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  statusMessage: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // context
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    // transform
    return next.handle().pipe(
      map(data => ({
        statusCode: response.statusCode,
        statusMessage: 'Success',
        data,
      })),
    );
  }
}
