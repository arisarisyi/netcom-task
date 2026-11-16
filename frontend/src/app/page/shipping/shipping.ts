import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { UNSHIPPED_STATUSES } from '../../core/crud-config';
import { extractErrorMessage } from '../../core/auth-service';

interface OrderRow {
  order_id: string;
  customer_id: string;
  order_status: string;
  order_purchase_timestamp: string;
  order_estimated_delivery_date: string;
}

@Component({
  selector: 'app-shipping',
  imports: [
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './shipping.html',
  styleUrl: './shipping.css',
})
export class Shipping implements OnInit {
  private readonly http = inject(HttpClient);

  protected readonly statuses = UNSHIPPED_STATUSES;
  protected readonly displayedColumns = ['order_id', 'status', 'purchase', 'estimated', 'customer'];

  protected readonly rows = signal<OrderRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(20);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.http
      .get<{ data: { data: OrderRow[]; total: number } }>('/api/orders', {
        params: {
          page: String(this.pageIndex() + 1),
          limit: String(this.pageSize()),
          order_status: this.statuses.join(','),
        },
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.data?.data ?? []);
          this.total.set(res.data?.total ?? 0);
        },
        error: (err) => this.error.set(extractErrorMessage(err)),
        complete: () => this.loading.set(false),
      });
  }

  protected onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  protected fmtDateTime(value: string): string {
    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }

  protected statusLabel(status: string): string {
    const labels: Record<string, string> = {
      created: 'Dibuat',
      approved: 'Disetujui',
      invoiced: 'Difakturkan',
      processing: 'Diproses',
    };
    return labels[status] ?? status;
  }
}
