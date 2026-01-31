import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    RouterLink,
    TitleCasePipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit {
  // Dependency injection
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);


  form!: FormGroup;
  productId: number | null = null;

  // Signals for reactive UI
  isEditMode = signal(false);
  categories = signal<string[]>([]);
  isSaving = signal(false);

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadCategories();
    if (id) {
      this.productId = +id;
      this.isEditMode.set(true);
      this.loadProductData(this.productId);
    }
  }

  private initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required]],
      image: [
        'https://picsum.photos/seed/picsum/500',
        [Validators.required],
      ],
      category: ['', [Validators.required]],
    });
  }

  loadProductData(id: number) {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.form.patchValue(product);
      },
      error: () => this.showError('Error cargando el producto'),
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error(err),
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      panelClass: 'dialog-container',
      data: {
        title: 'Confirmar cambios',
        message: '',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.isSaving.set(true);
      this.form.disable();

      const productData = this.form.getRawValue();

      const request$ =
        this.isEditMode() && this.productId
          ? this.productService.updateProduct(this.productId, productData)
          : this.productService.createProduct(productData);

      request$.subscribe({
        next: () => {
          this.handleSuccess(
            this.isEditMode()
              ? 'Producto actualizado correctamente'
              : 'Producto creado correctamente'
          );
        },
        error: () => {
          this.isSaving.set(false);
          this.form.enable();
          this.showError(
            this.isEditMode() ? 'Error al actualizar el producto' : 'Error al crear el producto'
          );
        },
      });
    });
  }

  private handleSuccess(msg: string) {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
    this.router.navigate(['/products']);
  }

  private showError(msg: string) {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
  }
}
