import { Product } from "../../../lib/types/product";
import { ProductCollection } from "../../../lib/enums/product.enum";
import { getNewDropRegisteredDate, isNewDrop } from "../../../lib/newDrops";
import i18n from "../../../i18n";

/** Translated league / collection name; callers re-render on language change via useTranslation. */
export function collectionLabel(collection: ProductCollection): string {
  const key =
    collection === ProductCollection.DISH || collection === ProductCollection.DRINK
      ? ProductCollection.OTHER
      : collection;
  return i18n.t(`collections.${key}`, { defaultValue: String(collection).replace(/_/g, " ") });
}

export function isNewProduct(product: Product): boolean {
  const registered = getNewDropRegisteredDate(product);
  return isNewDrop(registered);
}

export function sizeLabel(product: Product): string {
  if (product.productCollection === ProductCollection.DRINK) {
    return `${product.productVolume} L`;
  }
  return String(product.productSize || "").replace(/_/g, " ");
}
