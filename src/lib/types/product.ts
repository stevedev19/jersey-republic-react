import { 
    ProductStatus, 
    ProductCollection, 
    ProductSize 
} from "../enums/product.enum";

export interface Product {
    _id: string;
    productStatus: ProductStatus;
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productSize: ProductSize;
    productVolume: number;
    productDesc?: string;
    productImages: string[];
    productViews: number;
    /** When set by the API, preferred over createdAt for “new drop” eligibility */
    releaseDate?: Date | string;
    /** Kit season label, e.g. from getCurrentSeason(); optional for legacy rows */
    uniformSeason?: string | null;
    /** Calendar year the jersey was manufactured (optional) */
    madeYear?: number | null;
    createdAt:Date;
    updatedAt: Date;
}

export interface ProductInquiry{
    order: string;
    page: number;
    limit: number;
    productCollection?:ProductCollection;
    search?: string;
}