
export interface ColorState {
  id: string;
  hex: string;
  locked: boolean;
  name: string;
}

export interface PaletteHistory {
  colors: ColorState[];
  timestamp: number;
}

export enum ModalType {
  NONE,
  TOOLS, // New Hub
  EXPORT,
  AI_GENERATE,
  DASHBOARD,
  IMAGE_UPLOAD,
  SETTINGS
}

export enum HarmonyMode {
  RANDOM = 'Random',
  ANALOGOUS = 'Analogous',
  MONOCHROMATIC = 'Monochromatic',
  TRIADIC = 'Triadic',
  COMPLEMENTARY = 'Complementary',
}

export enum LayoutMode {
  HORIZONTAL = 'Horizontal',
  VERTICAL = 'Vertical'
  // DIAGONAL Removed completely
}

export interface GeneratedPaletteResponse {
  palette_name: string;
  colors: {
    hex: string;
    name: string;
    description: string;
  }[];
}
