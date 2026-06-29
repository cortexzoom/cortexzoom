export interface ColorPalette {
  name: string;
  background: string; // e.g., #050505
  colors: string[]; // e.g., [#00AEEF, #6A00FF, #DFFF7A]
}

export interface VisualizerParams {
  speed: number; // 0.1 to 2.0
  amplitude: number; // 10 to 150
  frequency: number; // 0.005 to 0.05
  waveCount: number; // 2 to 6
  particleCount: number; // 0 to 300
  particleSpeed: number; // 0.2 to 3.0
  glowIntensity: number; // 5 to 40
  noiseLevel: number; // 0 to 50
  flowMode: "sine" | "turbulence" | "quantum" | "linear";
  soundFrequency: number; // 80 to 440 Hz
  synthVolume: number; // 0 to 1
  soundEnabled: boolean;
  interactiveForce: number; // repulsion/attraction force
  interactionMode: "attract" | "repel" | "distort" | "none";
}

export interface PresetResponse {
  styleTitle: string;
  description: string;
  colors: string[];
  background: string;
  flowMode: "sine" | "turbulence" | "quantum" | "linear";
  speed: number;
  amplitude: number;
  frequency: number;
  particleCount: number;
  glowIntensity: number;
  soundFrequency: number;
}
