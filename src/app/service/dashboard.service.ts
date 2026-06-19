import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DashboardData {
  chartDonut: { value: number }[];
  chartbar: { value: number }[];
  tableUsers: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://test-demo.aemenersol.com/api/dashboard';

  async getDashboardData(): Promise<DashboardData> {
    return await firstValueFrom(this.http.get<DashboardData>(this.apiUrl));
  }
}
