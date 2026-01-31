import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

// Provide the service to handle user session
@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient); // Dependency injection
    private apiUrl = 'https://fakestoreapi.com/auth/login';

    // Signals for reactive UI and realtime decisions
    currentUser = signal<any>(null);

    login(username: string, password: string) {
        // Token-based session implementation
        return this.http.post<{ token: string }>(this.apiUrl, { username, password }).pipe(
            tap((response) => {
                // Save token in localStorage
                localStorage.setItem('token', response.token);
                this.currentUser.set({ username });
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.currentUser.set(null);
    }

    get isAuthenticated(): boolean {
        // Double 'NOT' to return true if found and false if not
        return !!localStorage.getItem('token');
    }
}
