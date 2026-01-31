// Model to get the composed attribute 'rating'
export interface Rating {
    rate: number;
    count: number;
}

// Model that matches the FakeStoreAPI response model
export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating?: Rating;
}
