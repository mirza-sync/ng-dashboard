import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import PouchDB from 'pouchdb';

export interface User {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: User | null = null;
  private authenticated = false;
  private db = new PouchDB('assessment_auth');

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.authenticated = true;
    }

    this.seedDb();
  }

  get currentUser(): User | null {
    return this.user;
  }

  get isAuthenticated(): boolean {
    return this.authenticated;
  }

  private async seedDb() {
    const mockUserId = 'user@aemenersol.com';
    try {
      await this.db.get(mockUserId);
    } catch (err: any) {
      if (err.status === 404) {
        await this.db.put({
          _id: mockUserId,
          username: mockUserId,
          password: 'Test@123',
        });
        console.log('PouchDB seeded.');
      }
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const responseToken = await firstValueFrom(
        this.http.post(
          'http://test-demo.aemenersol.com/api/account/login',
          { username, password },
          { responseType: 'text' },
        ),
      );

      if (responseToken) {
        this.user = { username, password };
        this.authenticated = true;
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        localStorage.setItem('token', responseToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication error:', error);

      // User may be offline or the API may be down. Attempt to validate against the local PouchDB database.
      try {
        const userFromDb: any = await this.db.get(username);

        if (userFromDb && userFromDb.password === password) {
          console.log('Successfully validated via fallback PouchDB database.');
          this.user = {
            username: userFromDb.username,
            password: userFromDb.password,
          };
          this.authenticated = true;

          // Generate a fake token for interceptors to keep dashboard data fetching happy
          const fallbackToken =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.PouchDBFallbackToken';

          localStorage.setItem('currentUser', JSON.stringify(this.user));
          localStorage.setItem('token', fallbackToken);
          return true;
        }
      } catch (pouchError) {
        console.error(
          'PouchDB lookup failed. User credentials invalid.',
          pouchError,
        );
      }
      return false;
    }
  }

  logout(): void {
    this.user = null;
    this.authenticated = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
