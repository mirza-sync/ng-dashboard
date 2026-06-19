import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

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

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.authenticated = true;
    }
  }

  get currentUser(): User | null {
    return this.user;
  }

  get isAuthenticated(): boolean {
    return this.authenticated;
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
