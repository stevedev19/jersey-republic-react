import axios from "axios";
import { serverApi } from "../../lib/config";
import { Product, ProductInquiry } from "../../lib/types/product";

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

class ProductService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getProducts(
    input: ProductInquiry,
    options?: { signal?: AbortSignal }
  ): Promise<Product[]> {
    try {
      let url =
        this.path +
        `product/all?order=${input.order}&page=${input.page}&limit=${input.limit}`;

      if (input.productCollection)
        url += `&productCollection=${input.productCollection}`;
      if (input.search) url += `&search=${input.search}`;

      const result = await axios.get(url, { signal: options?.signal });
      const data = Array.isArray(result.data) ? result.data : [];
      return data;
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; name?: string };
      if (
        e?.code === "ERR_CANCELED" ||
        e?.name === "CanceledError" ||
        e?.message === "canceled"
      ) {
        throw err;
      }
      console.log("Error getProducts", err);
      throw err;
    }
  }

  /**
   * Jersey Roulette: prefer `random=true` if backend supports it (e.g. GET product/all?random=true&limit=8),
   * otherwise shuffle a larger pool client-side.
   */
  public async getRouletteProducts(count = 8): Promise<Product[]> {
    try {
      const url = `${this.path}product/all?limit=${count}&page=1&random=true&order=createdAt`;
      const result = await axios.get(url);
      const raw = Array.isArray(result.data) ? result.data : [];
      if (raw.length >= count) return raw.slice(0, count) as Product[];
    } catch {
      /* try fallback */
    }
    try {
      const pool = await this.getProducts({ page: 1, limit: 48, order: "productViews" });
      if (!pool.length) return [];
      const shuffled = shuffleInPlace([...pool]);
      return shuffled.slice(0, count);
    } catch {
      return [];
    }
  }

  public async getProduct(productId: string): Promise<Product> {
    try {
      const url = this.path + `product/${productId}`;
      const result = await axios.get(url, { withCredentials: true });
      const data =
        result.data && typeof result.data === "object" ? result.data : ({} as Product);
      return data;
    } catch (err) {
      console.log("Error getProduct", err);
      throw err;
    }
  }
}

export default ProductService;
