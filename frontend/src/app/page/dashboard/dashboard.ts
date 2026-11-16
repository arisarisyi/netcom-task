import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { AuthService, extractErrorMessage } from '../../core/auth-service';
import { canReadOrders } from '../../core/roles';

interface DailyRevenue {
  date: string;
  revenue: number;
  order_count: number;
}

interface DailyRevenueResponse {
  month: number;
  year: number;
  data: DailyRevenue[];
}

interface RevenueAnomaly extends DailyRevenue {
  z_score: number | null;
  is_anomaly: boolean;
  direction: 'above' | 'below' | null;
}

interface RevenueAnomalyResponse {
  month: number;
  year: number;
  threshold: number;
  mean: number;
  std_dev: number;
  anomaly_count: number;
  data: RevenueAnomaly[];
}

interface OrderRow {
  order_id: string;
  customer_id: string;
  order_status: string;
  order_purchase_timestamp: string;
}

interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const CHART_W = 640;
const CHART_H = 300;
const PAD = { top: 20, right: 16, bottom: 34, left: 56 };

const BAR_W = 640;
const BAR_H = 240;

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const WEEKDAY_JS = [1, 2, 3, 4, 5, 6, 0];

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  const scaled = value / pow;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
  return step * pow;
}

function barPath(x: number, y: number, w: number, h: number): string {
  if (h < 0.5) return '';
  const r = Math.min(4, h);
  const bottom = y + h;
  return (
    'M' + x + ',' + bottom +
    ' L' + x + ',' + (y + r) +
    ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
    ' L' + (x + w - r) + ',' + y +
    ' Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) +
    ' L' + (x + w) + ',' + bottom + ' Z'
  );
}

const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
const nfCompact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });

@Component({
  selector: 'app-dashboard',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  protected readonly user = this.auth.user;
  protected readonly displayName = computed(
    () => this.user()?.name ?? this.user()?.email ?? 'Pengguna',
  );

  protected readonly canViewOrders = canReadOrders(this.auth.user()?.role ?? null);

  protected readonly month = signal(new Date().getMonth() + 1);
  protected readonly year = signal(new Date().getFullYear());
  protected readonly monthNames = MONTH_NAMES;
  protected readonly yearOptions: number[] = [];
  protected readonly periodLabel = computed(
    () => MONTH_NAMES[this.month() - 1] + ' ' + this.year(),
  );

  protected readonly revenue = signal<DailyRevenue[]>([]);
  protected readonly anomalies = signal<RevenueAnomalyResponse | null>(null);
  protected readonly prevTotals = signal<{ revenue: number; orders: number } | null>(null);

  protected readonly loading = signal(true);
  protected readonly refreshing = signal(false);
  protected readonly error = signal('');

  protected readonly totalRevenue = computed(() =>
    this.revenue().reduce((sum, row) => sum + row.revenue, 0),
  );
  protected readonly totalOrders = computed(() =>
    this.revenue().reduce((sum, row) => sum + row.order_count, 0),
  );
  protected readonly avgPerOrder = computed(() => {
    const orders = this.totalOrders();
    return orders > 0 ? this.totalRevenue() / orders : null;
  });
  protected readonly anomalyCount = computed(() => this.anomalies()?.anomaly_count ?? 0);
  protected readonly anomalyList = computed(() =>
    (this.anomalies()?.data ?? []).filter((row) => row.is_anomaly),
  );

  protected readonly revenueDelta = computed(() =>
    this.delta(this.totalRevenue(), this.prevTotals()?.revenue ?? null),
  );
  protected readonly ordersDelta = computed(() =>
    this.delta(this.totalOrders(), this.prevTotals()?.orders ?? null),
  );

  constructor() {
    const now = new Date().getFullYear();
    for (let y = 2014; y <= now; y++) this.yearOptions.push(y);
  }

  ngOnInit(): void {
    this.loadRevenue();
    if (this.canViewOrders) this.loadOrders();
  }

  private delta(current: number, previous: number | null): number | null {
    if (previous === null || previous <= 0) return null;
    return ((current - previous) / previous) * 100;
  }

  private params(month: number, year: number): HttpParams {
    return new HttpParams().set('month', String(month)).set('year', String(year));
  }

  private loadRevenue(): void {
    const firstLoad = !this.hasLoaded;
    if (firstLoad) this.loading.set(true);
    else this.refreshing.set(true);
    this.error.set('');

    const month = this.month();
    const year = this.year();
    const prevMonth = month === 1 ? { m: 12, y: year - 1 } : { m: month - 1, y: year };

    forkJoin({
      daily: this.http.get<{ data: DailyRevenueResponse }>('/api/revenues/daily', {
        params: this.params(month, year),
      }),
      anomaly: this.http.get<{ data: RevenueAnomalyResponse }>('/api/revenues/anomalies', {
        params: this.params(month, year).set('threshold', '2'),
      }),
      prev: this.http.get<{ data: DailyRevenueResponse }>('/api/revenues/daily', {
        params: this.params(prevMonth.m, prevMonth.y),
      }),
    }).subscribe({
      next: ({ daily, anomaly, prev }) => {
        if (month !== this.month() || year !== this.year()) return;
        const prevRows = prev.data?.data ?? [];
        const prevRevenue = prevRows.reduce((s, r) => s + r.revenue, 0);
        const prevOrders = prevRows.reduce((s, r) => s + r.order_count, 0);
        this.revenue.set(daily.data?.data ?? []);
        this.anomalies.set(anomaly.data ?? null);
        this.prevTotals.set({ revenue: prevRevenue, orders: prevOrders });
        this.hasLoaded = true;
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err));
      },
      complete: () => {
        this.loading.set(false);
        this.refreshing.set(false);
      },
    });
  }

  private hasLoaded = false;

  protected setMonth(value: number): void {
    if (value === this.month()) return;
    this.month.set(value);
    this.loadRevenue();
  }

  protected setYear(value: number): void {
    if (value === this.year()) return;
    this.year.set(value);
    this.loadRevenue();
  }

  protected shiftMonth(delta: number): void {
    let m = this.month() + delta;
    let y = this.year();
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    this.month.set(m);
    this.year.set(y);
    this.loadRevenue();
  }

  protected readonly lineChart = computed(() => {
    const data = this.revenue();
    const innerW = CHART_W - PAD.left - PAD.right;
    const innerH = CHART_H - PAD.top - PAD.bottom;
    const max = niceCeil(Math.max(...data.map((d) => d.revenue), 1));

    const x = (i: number) => PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

    const points = data.map((row, i) => ({
      cx: x(i),
      cy: y(row.revenue),
      date: row.date,
      revenue: row.revenue,
      order_count: row.order_count,
    }));

    const linePath = points
      .map((p, i) => (i === 0 ? 'M' : 'L') + p.cx.toFixed(1) + ',' + p.cy.toFixed(1))
      .join(' ');
    const lastX = points.length ? points[points.length - 1].cx : PAD.left;
    const firstX = points.length ? points[0].cx : PAD.left;
    const baseline = PAD.top + innerH;
    const areaPath = points.length
      ? linePath + ' L' + lastX.toFixed(1) + ',' + baseline + ' L' + firstX.toFixed(1) + ',' + baseline + ' Z'
      : '';

    const tickCount = 4;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
      const value = (max * i) / tickCount;
      return { y: y(value), value, label: nfCompact.format(value) };
    });

    const xLabels = data
      .filter((_, i) => i % 5 === 0)
      .map((row, k) => ({ x: x(k * 5), label: String(k * 5 + 1) }));

    const maxPoint = points.reduce<((typeof points)[number]) | null>(
      (best, p) => (best === null || p.revenue > best.revenue ? p : best),
      null,
    );

    return { points, linePath, areaPath, ticks, xLabels, maxPoint };
  });

  protected readonly hoverIndex = signal<number | null>(null);
  protected readonly hoverPoint = computed(() => {
    const idx = this.hoverIndex();
    if (idx === null) return null;
    const p = this.lineChart().points[idx];
    if (!p) return null;
    return { ...p, flip: p.cx > CHART_W * 0.6 };
  });

  protected onLineMove(event: PointerEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const vx = ((event.clientX - rect.left) / rect.width) * CHART_W;
    const points = this.lineChart().points;
    let best = 0;
    for (let i = 1; i < points.length; i++) {
      if (Math.abs(points[i].cx - vx) < Math.abs(points[best].cx - vx)) best = i;
    }
    this.hoverIndex.set(best);
  }

  protected onLineLeave(): void {
    this.hoverIndex.set(null);
  }

  protected onLineKey(event: KeyboardEvent): void {
    const points = this.lineChart().points;
    if (!points.length) return;
    const current = this.hoverIndex() ?? 0;
    if (event.key === 'ArrowLeft') {
      this.hoverIndex.set(Math.max(0, current - 1));
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      this.hoverIndex.set(Math.min(points.length - 1, current + 1));
      event.preventDefault();
    }
  }

  protected readonly weekdayChart = computed(() => {
    const data = this.revenue();
    const totals = new Array<number>(7).fill(0);
    for (const row of data) {
      const day = new Date(row.date + 'T00:00:00Z').getUTCDay();
      totals[day] += row.revenue;
    }

    const ordered = WEEKDAY_JS.map((js, i) => ({ label: WEEKDAYS[i], value: totals[js] }));
    const max = niceCeil(Math.max(...ordered.map((d) => d.value), 1));
    const innerW = BAR_W - PAD.left - PAD.right;
    const innerH = BAR_H - PAD.top - PAD.bottom;
    const band = innerW / ordered.length;
    const barWidth = Math.min(24, band * 0.6);

    const bars = ordered.map((d, i) => {
      const h = (d.value / max) * innerH;
      const bx = PAD.left + band * i + (band - barWidth) / 2;
      const by = PAD.top + innerH - h;
      return {
        ...d,
        x: bx,
        y: by,
        w: barWidth,
        h,
        path: barPath(bx, by, barWidth, h),
        share: d.value > 0 ? (d.value / ordered.reduce((s, o) => s + o.value, 0)) * 100 : 0,
      };
    });

    const ticks = Array.from({ length: 3 }, (_, i) => {
      const value = (max * i) / 2;
      return { y: PAD.top + innerH - (value / max) * innerH, label: nfCompact.format(value) };
    });

    return { bars, ticks };
  });

  protected readonly hoverBar = signal<number | null>(null);
  protected readonly hoverBarData = computed(() => {
    const idx = this.hoverBar();
    if (idx === null) return null;
    const bar = this.weekdayChart().bars[idx];
    if (!bar) return null;
    return { ...bar, flip: bar.x + bar.w > BAR_W * 0.6 };
  });

  protected showTable = signal(false);

  protected readonly orders = signal<OrderRow[]>([]);
  protected readonly ordersTotal = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly ordersLoading = signal(false);
  protected readonly orderColumns = ['order_id', 'status', 'purchase', 'customer'];

  protected onOrdersPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadOrders();
  }

  private loadOrders(): void {
    this.ordersLoading.set(true);
    this.http
      .get<{ data: Paginated<OrderRow> }>('/api/orders', {
        params: new HttpParams()
          .set('page', String(this.pageIndex() + 1))
          .set('limit', String(this.pageSize())),
      })
      .subscribe({
        next: (res) => {
          this.orders.set(res.data?.data ?? []);
          this.ordersTotal.set(res.data?.total ?? 0);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err));
        },
        complete: () => this.ordersLoading.set(false),
      });
  }

  protected fmt(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : nf.format(value);
  }

  protected fmtCompact(value: number): string {
    return nfCompact.format(value);
  }

  protected fmtDay(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  protected fmtDayLong(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  protected fmtDateTime(value: string): string {
    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected fmtScore(z: number | null): string {
    if (z === null) return '—';
    return z.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
