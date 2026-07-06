interface LenisInstance {
  raf: (time: number) => void;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  actualScroll?: number;
  targetScroll?: number;
  scroll?: number;
  animatedScroll?: number;
}

interface Window {
  Lenis?: new (opts: Record<string, unknown>) => LenisInstance;
  _stars?: unknown[];
  _starRAF?: number;
}
