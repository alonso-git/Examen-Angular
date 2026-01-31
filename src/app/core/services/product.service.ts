import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { Product } from '../models/product.model';

/*
    **In this code you can found several occurrences of the same strategy:

    FakeStoreAPI does not allow you to save data, and any update will return '200 OK',
    but the changes won't persist. To mitigate this, I implemented a series of process
    that store the information locally and allow you to see the changes applied. 
    I noticed that this strategy could also help reduce the traffic and delay,
    by handling wisely the local information instead of asking each time for the
    whole list of register in the backend.
*/

// Provide the service to interact with FakeStoreAPI
@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = 'https://fakestoreapi.com/products';

    // Signals for reactive UI and realtime decisions
    products = signal<Product[]>([]);

    getAllProducts(): Observable<Product[]> {
        // Avoid reloading products from API
        if (this.products().length > 0) {
            return of(this.products());
        }

        return this.http.get<Product[]>(this.apiUrl).pipe(
            // Save products on signal
            tap((data) => this.products.set(data))
        );
    }

    getProductById(id: number): Observable<Product> {
        // Avoid reloading products from API
        const localProduct = this.products().find((p) => p.id === id);

        if (localProduct) {
            return of(localProduct);
        }

        // In case is not loaded (rare) ask API
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    createProduct(product: Omit<Product, 'id'>): Observable<Product> {
        // Mock API request (it is sent and processed but has no effect)
        return this.http.post<Product>(this.apiUrl, product).pipe(
            map((response) => {
                // Generate random ID (API always returns ID: 21)
                const newProduct: Product = {
                    ...product,
                    id: Date.now(), // ID único local
                };

                // Avoid reloading list each time a Product is created
                this.products.update((current) => [newProduct, ...current]);

                return newProduct;
            })
        );
    }

    updateProduct(id: number, product: Partial<Product>): Observable<Product> {
        // IDs over 200 are certainly generated, indicating a product that won't exist in API
        if (id > 200) {
            this.updateLocalSignal(id, product);
            return of({ ...product, id } as Product);
        }

        // IDs from 1-20 are available products on the API
        return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
            tap(() => {
                // Avoid reloading the whole list
                this.updateLocalSignal(id, product);
            })
        );
    }

    deleteProduct(id: number): Observable<any> {
        // Local products are only removed from the list
        if (id > 200) {
            this.products.update((current) => current.filter((p) => p.id !== id));
            return of(true);
        }

        // For real products we use the API
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                // Avoid reloading the whole list
                this.products.update((current) => current.filter((p) => p.id !== id));
            })
        );
    }

    getCategories(): Observable<string[]> {
        return this.http.get<string[]>('https://fakestoreapi.com/products/categories');
    }

    private updateLocalSignal(id: number, changes: Partial<Product>) {
        this.products.update((current) =>
            current.map((p) => (p.id === id ? { ...p, ...changes } : p))
        );
    }
}
