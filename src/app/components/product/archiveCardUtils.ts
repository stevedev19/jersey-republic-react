import { Product } from "../../../lib/types/product";
import { ProductCollection } from "../../../lib/enums/product.enum";
import { getNewDropRegisteredDate, isNewDrop } from "../../../lib/newDrops";

export function collectionLabel(collection: ProductCollection): string {
  const names: Record<string, string> = {
    PREMIER_LEAGUE: "Premier League",
    LA_LIGA: "La Liga",
    SERIE_A: "Serie A",
    BUNDESLIGA: "Bundesliga",
    LIGUE_1: "Ligue 1",
    CHAMPIONS_LEAGUE: "Champions League",
    NATIONAL_TEAMS: "National Teams",
    UZBEKISTAN_LEAGUE: "Uzbekistan League",
    RETRO: "Retro",
    OTHER: "Other",
    DISH: "Other",
    DRINK: "Other",
  };
  return names[collection] || String(collection).replace(/_/g, " ");
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
