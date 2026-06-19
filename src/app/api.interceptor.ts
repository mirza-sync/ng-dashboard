import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { delay, Observable, of, throwError } from 'rxjs';
import { User } from './service/auth.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor() {}

  mockUser: User = {
    username: 'user@aemenersol.com',
    password: 'Test@123',
  };

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const { url, method, body, headers } = request;

    const token = localStorage.getItem('token');
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    if (
      url === 'http://test-demo.aemenersol.com/api/account/login' &&
      method === 'POST'
    ) {
      const { username, password } = body;

      if (
        username === this.mockUser.username &&
        password === this.mockUser.password
      ) {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MockToken';
        return of(new HttpResponse({ status: 200, body: mockToken })).pipe(
          delay(800),
        );
      } else {
        return throwError(() => new Error('Invalid username or password'));
      }
    }

    return next.handle(request);
  }
}
