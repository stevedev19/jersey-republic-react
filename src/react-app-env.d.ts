/// <reference types="react-scripts" />

declare module "drift-zoom" {
  export default class Drift {
    constructor(
      triggerEl: HTMLElement,
      options?: {
        namespace?: string | null;
        paneContainer?: HTMLElement;
        inlinePane?: boolean | number;
        zoomFactor?: number;
        hoverBoundingBox?: boolean;
        handleTouch?: boolean;
        injectBaseStyles?: boolean;
        boundingBoxContainer?: HTMLElement;
        sourceAttribute?: string;
      }
    );
    destroy(): void;
    setZoomImageURL(url: string): void;
  }
}
