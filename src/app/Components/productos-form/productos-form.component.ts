import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductoService } from '../../Services/producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './productos-form.component.html',
  styleUrls: ['./productos-form.component.css']
})
export class ProductoFormComponent implements OnInit, OnDestroy {
  productoForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEditMode = false;
  productoId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private productoService: ProductoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.productoId = +params['id'];
          this.loadProducto(this.productoId);
        }
      });

    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.productoForm = this.formBuilder.group({
      codigo: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9\-_]+$/)
      ]],
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]],
      descripcion: ['', [
        Validators.maxLength(500)
      ]],
      precio: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999.99)
      ]],
      stock: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/)
      ]],
      activo: [true]
    });
  }

  private loadProducto(id: number): void {
    this.loading = true;

    this.productoService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (producto) => {
          this.productoForm.patchValue({
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
            activo: producto.activo
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando producto:', error);
          this.errorMessage = error.message || 'Error al cargar el producto';
          this.loading = false;
        }
      });
  }

  get codigo() {
    return this.productoForm.get('codigo');
  }

  get nombre() {
    return this.productoForm.get('nombre');
  }

  get descripcion() {
    return this.productoForm.get('descripcion');
  }

  get precio() {
    return this.productoForm.get('precio');
  }

  get stock() {
    return this.productoForm.get('stock');
  }

  get activo() {
    return this.productoForm.get('activo');
  }

  hasError(controlName: string): boolean {
    const control = this.productoForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.productoForm.get(controlName);
    const fieldLabel = this.getFieldLabel(controlName);

    if (control?.hasError('required')) {
      return `${fieldLabel} es obligatorio`;
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${fieldLabel} debe tener al menos ${minLength} caracteres`;
    }

    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `${fieldLabel} no puede exceder ${maxLength} caracteres`;
    }

    if (control?.hasError('min')) {
      const minValue = control.errors?.['min'].min;
      return `${fieldLabel} debe ser mayor o igual a ${minValue}`;
    }

    if (control?.hasError('max')) {
      const maxValue = control.errors?.['max'].max;
      return `${fieldLabel} no puede exceder ${maxValue}`;
    }

    if (control?.hasError('pattern')) {
      if (controlName === 'codigo') {
        return 'El código solo puede contener letras, números, guiones y guiones bajos';
      }
      if (controlName === 'stock') {
        return 'El stock debe ser un número entero';
      }
    }

    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      'codigo': 'Código',
      'nombre': 'Nombre',
      'descripcion': 'Descripción',
      'precio': 'Precio',
      'stock': 'Stock',
      'activo': 'Estado'
    };
    return labels[controlName] || controlName;
  }

  onSubmit(): void {
    this.productoForm.markAllAsTouched();

    if (this.productoForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const productoData = this.productoForm.value;

    if (this.isEditMode && this.productoId) {
      this.productoService.update(this.productoId, productoData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/productos'], {
              queryParams: { success: 'updated' }
            });
          },
          error: (error) => {
            console.error('Error actualizando producto:', error);
            this.errorMessage = error.message || 'Error al actualizar el producto';
            this.loading = false;
          }
        });
    } else {
      this.productoService.create(productoData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/productos'], {
              queryParams: { success: 'created' }
            });
          },
          error: (error) => {
            console.error('Error creando producto:', error);
            this.errorMessage = error.message || 'Error al crear el producto';
            this.loading = false;
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/productos']);
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
