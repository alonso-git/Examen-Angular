import { CurrencyPipe, SlicePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    SlicePipe,
    UpperCasePipe,
    RouterLink,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    TitleCasePipe,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  // Dependency injection
  private productService = inject(ProductService);
  private snackbar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals for reactive UI
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');
  categories = signal<string[]>([]);
  selectedCategory = signal<string>('');

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando productos');
        this.isLoading.set(false);
      },
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error(err),
    });
  }

  deleteProduct(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      panelClass: 'dialog-container',
      data: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que deseas eliminar este producto?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.snackbar.open('Producto eliminado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        },
        error: (err) => {
          console.error(err);
          this.snackbar.open('Error al eliminar producto', 'Cerrar', { duration: 3000 });
        },
      });
    });
  }

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    const allProducts = this.productService.products();

    return allProducts.filter((product) => {
      const matchesText = product.title.toLowerCase().includes(query);

      const matchesCategory = category ? product.category === category : true;

      return matchesText && matchesCategory;
    });
  });
}
