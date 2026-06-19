import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DashboardData, DashboardService } from '../service/dashboard.service';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../service/auth.service';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  @ViewChild('donutCanvas', { static: false })
  donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas', { static: false })
  barCanvas!: ElementRef<HTMLCanvasElement>;

  dashboardData: DashboardData | null = null;
  tableData: DashboardData['tableUsers'] = [];

  async ngOnInit() {
    try {
      this.dashboardData = await this.dashboardService.getDashboardData();
      if (this.dashboardData) {
        this.initDonutChart(this.dashboardData);
        this.initBarChart(this.dashboardData);
        this.tableData = this.dashboardData.tableUsers;
      }
    } catch (err) {
      console.error(err);
    }
  }

  initDonutChart(data: DashboardData) {
    const donutData = data.chartDonut.map((item) => item.value);

    new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: donutData,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  initBarChart(data: DashboardData) {
    const barData = data.chartbar.map((item) => item.value);

    new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Revenue',
            data: barData,
            backgroundColor: '#36A2EB',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
