import { Component, Inject, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CrudDataset, CrudField } from '../../core/crud-config';

export interface CrudDialogData {
  config: CrudDataset;
  fields: CrudField[];
  mode: 'create' | 'edit';
  row: Record<string, unknown>;
}

export function toLocalInput(value: unknown): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) + ':' + pad(d.getMinutes())
  );
}

@Component({
  selector: 'app-crud-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './crud-dialog.html',
  styleUrl: './crud-dialog.css',
})
export class CrudDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<CrudDialog>);

  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: CrudDialogData,
  ) {}

  protected form!: FormGroup;
  protected lockedKeys: Set<string> = new Set();

  ngOnInit(): void {
    const cfg = this.data.config;
    this.lockedKeys = new Set(this.data.mode === 'edit' ? cfg.idKeys : []);
    const group: Record<string, FormControl> = {};
    for (const f of this.data.fields) {
      const value = this.data.row[f.key] ?? '';
      const locked = this.lockedKeys.has(f.key);
      const validators = f.required && !locked ? Validators.required : [];
      group[f.key] = this.fb.control(
        f.type === 'datetime' ? toLocalInput(value) : value === null ? '' : value,
        validators,
      );
    }
    this.form = this.fb.group(group);
  }

  protected isLocked(field: CrudField): boolean {
    return this.lockedKeys.has(field.key);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const out: Record<string, unknown> = {};
    for (const f of this.data.fields) {
      const raw = this.form.value[f.key];
      if (f.type === 'datetime') {
        out[f.key] = raw ? new Date(raw).toISOString() : null;
      } else if (f.type === 'number') {
        out[f.key] = raw === '' || raw === null ? null : Number(raw);
      } else {
        out[f.key] = raw === '' && f.nullable ? null : raw;
      }
    }
    this.ref.close(out);
  }
}
