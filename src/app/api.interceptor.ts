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

    if (
      url === 'http://test-demo.aemenersol.com/api/dashboard' &&
      method === 'GET'
    ) {
      const hasAuthHeader =
        headers.has('Authorization') || request.headers.has('Authorization');
      if (!hasAuthHeader && !token) {
        return throwError(() => new Error('Missing Bearer Token'));
      }

      const mockDashboardData = {
        chartDonut: [{ value: 55 }, { value: 25 }, { value: 20 }, { value: 5 }],
        chartbar: [
          { value: 12000 },
          { value: 19000 },
          { value: 15000 },
          { value: 12000 },
          { value: 19000 },
          { value: 15000 },
          { value: 15000 },
        ],
        tableUsers: [
          {
            id: 1,
            firstName: 'Mark',
            lastName: 'Otto',
            username: '@mdo',
          },
          {
            id: 2,
            firstName: 'Jacob',
            lastName: 'Throton',
            username: '@fat',
          },
          {
            id: 3,
            firstName: 'Larry',
            lastName: 'theBird',
            username: '@twitter',
          },
        ],
      };

      return of(
        new HttpResponse({ status: 200, body: mockDashboardData }),
      ).pipe(delay(600));
    }

    return next.handle(request);
  }
}
