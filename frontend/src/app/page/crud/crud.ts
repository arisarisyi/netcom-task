import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
  Inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { DATASETS, CrudField, newId } from '../../core/crud-config';
import { AuthService, extractErrorMessage } from '../../core/auth-service';
import { canWriteDataset } from '../../core/roles';
import { CrudDialog } from './crud-dialog';

interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

type Row = Record<string, unknown>;

@Component({
  selector: 'app-crud',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './crud.html',
  styleUrl: './crud.css',
})
export class Crud {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);

  protected readonly config = toSignal(
    this.route.data.pipe(map((d) => DATASETS[d['dataset'] as string])),
    { initialValue: undefined },
  );

  protected readonly canWrite = computed(
    () => canWriteDataset(this.config()?.key ?? '', this.auth.user()?.role ?? null),
  );

  protected readonly rows = signal<Row[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(20);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  protected readonly sortField = signal<string | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');

  protected readonly visibleFields = computed(() =>
    (this.config()?.fields ?? []).filter((f) => !f.hideInTable),
  );
  protected readonly tableColumns = computed(() =>
    this.canWrite() ? [...this.visibleFields().map((f) => f.key), 'aksi'] : this.visibleFields().map((f) => f.key),
  );

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (!cfg) return;
      this.pageIndex.set(0);
      this.sortField.set(null);
      this.sortDir.set('asc');
      untracked(() => this.load());
    });
  }

  private load(): void {
    const cfg = this.config();
    if (!cfg) return;
    this.loading.set(true);
    this.error.set('');
    const params: Record<string, string> = {
      page: String(this.pageIndex() + 1),
      limit: String(this.pageSize()),
    };
    if (this.sortField()) {
      params['sort'] = this.sortField() as string;
      params['dir'] = this.sortDir();
    }
    this.http
      .get<{ data: Paginated<Row> }>(cfg.endpoint, { params })
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

  protected onSortChange(sort: Sort): void {
    this.sortField.set(sort.direction ? sort.active : null);
    this.sortDir.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.pageIndex.set(0);
    this.load();
  }

  protected refresh(): void {
    this.load();
  }

  protected openCreate(): void {
    const cfg = this.config();
    if (!cfg) return;
    const fields = cfg.fields.filter((f) => !f.hideInForm);
    const prefill: Row = {};
    for (const f of fields) {
      if (f.autoId) prefill[f.key] = newId();
    }
    const ref = this.dialog.open(CrudDialog, {
      width: '560px',
      maxWidth: '95vw',
      data: { config: cfg, fields, mode: 'create', row: prefill },
    });
    ref.afterClosed().subscribe((value: Row | undefined) => {
      if (!value || this.saving()) return;
      this.saving.set(true);
      this.http.post<{ data: Row }>(cfg.endpoint, value).subscribe({
        next: () => this.load(),
        error: (err) => {
          this.error.set(extractErrorMessage(err));
          this.saving.set(false);
        },
        complete: () => this.saving.set(false),
      });
    });
  }

  protected openEdit(row: Row): void {
    const cfg = this.config();
    if (!cfg) return;
    const ref = this.dialog.open(CrudDialog, {
      width: '560px',
      maxWidth: '95vw',
      data: { config: cfg, fields: cfg.fields.filter((f) => !f.hideInForm), mode: 'edit', row },
    });
    ref.afterClosed().subscribe((value: Row | undefined) => {
      if (!value || this.saving()) return;
      this.saving.set(true);
      this.http
        .put<{ data: Row }>(cfg.endpoint + '/' + this.idPath(row), value)
        .subscribe({
          next: () => this.load(),
          error: (err) => {
            this.error.set(extractErrorMessage(err));
            this.saving.set(false);
          },
          complete: () => this.saving.set(false),
        });
    });
  }

  protected confirmDelete(row: Row): void {
    const cfg = this.config();
    if (!cfg) return;
    const ref = this.dialog.open(DeleteDialog, {
      width: '380px',
      maxWidth: '95vw',
      data: { title: cfg.title, label: this.rowLabel(row) },
    });
    ref.afterClosed().subscribe((ok: boolean | undefined) => {
      if (!ok || this.saving()) return;
      this.saving.set(true);
      this.http.delete(cfg.endpoint + '/' + this.idPath(row)).subscribe({
        next: () => {
          if (this.rows().length === 1 && this.pageIndex() > 0) this.pageIndex.update((p) => p - 1);
          this.load();
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err));
          this.saving.set(false);
        },
        complete: () => this.saving.set(false),
      });
    });
  }

  protected idPath(row: Row): string {
    const cfg = this.config();
    if (!cfg) return '';
    return cfg.idKeys.map((k) => encodeURIComponent(String(row[k] ?? ''))).join('/');
  }

  private rowLabel(row: Row): string {
    const cfg = this.config();
    if (!cfg) return '';
    const first = cfg.idKeys[0];
    return String(row[first] ?? '');
  }

  protected cellValue(field: CrudField, row: Row): string {
    const value = row[field.key];
    if (value === null || value === undefined || value === '') return '—';
    if (field.format === 'datetime') {
      return new Date(String(value)).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
      });
    }
    if (field.format === 'currency') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(Number(value));
    }
    if (field.format === 'number') return new Intl.NumberFormat('id-ID').format(Number(value));
    return String(value);
  }

  protected isLongId(field: CrudField, row: Row): boolean {
    return field.maxLength === 32;
  }
}

@Component({
  selector: 'app-delete-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Hapus data?</h2>
    <mat-dialog-content>
      <p class="del-label">{{ data.label }}</p>
      <p class="del-note">Data {{ data.title }} dengan ID di atas akan dihapus permanen.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close type="button">Batal</button>
      <button matButton class="del-btn" mat-dialog-close type="button" (click)="confirm()">
        <span class="material-symbols-outlined" aria-hidden="true">delete</span> Hapus
      </button>
    </mat-dialog-actions>
  `,
})
export class DeleteDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: { title: string; label: string },
    private ref: MatDialogRef<DeleteDialog>,
  ) {}
  protected confirm(): void {
    this.ref.close(true);
  }
}
