import { useEffect, useRef } from "react";

export function useAudioSynth(
  enabled: boolean,
  baseFrequency: number,
  volume: number,
  waveSpeed: number
) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  // Initialize audio context lazily on first user gesture or enable action
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      // Standard cross-browser AudioContext initialization
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      // 1. Create Filter to shave off harsh high frequencies for a warm luxury drone feel
      const lowpassFilter = ctx.createBiquadFilter();
      lowpassFilter.type = "lowpass";
      lowpassFilter.frequency.setValueAtTime(320, ctx.currentTime);
      lowpassFilter.Q.setValueAtTime(4, ctx.currentTime);
      filterRef.current = lowpassFilter;

      // 2. Create Primary Oscillator (Warm deep sine/triangle)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(baseFrequency, ctx.currentTime);
      oscRef.current = osc1;

      // 3. Create Secondary Oscillator (Detuned slightly for holographic chorus sound)
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(baseFrequency * 1.5 + 1.2, ctx.currentTime); // Perfect fifth + detune
      osc2Ref.current = osc2;

      // 4. Create LFO for slow volumetric swelling
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.2 * waveSpeed, ctx.currentTime); // slow swell
      lfoRef.current = lfo;

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.3, ctx.currentTime);
      lfoGainRef.current = lfoGain;

      // 5. Connect LFO to filter frequency for sweep sweeps
      lfo.connect(lfoGain);
      lfoGain.connect(lowpassFilter.frequency);

      // 6. Main Gain Node
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime); // start silent
      gainNodeRef.current = gainNode;

      // Sub-gain to keep detuned triangle oscillator subtle
      const triangleGain = ctx.createGain();
      triangleGain.gain.setValueAtTime(0.25, ctx.currentTime);

      // Connect nodes
      osc1.connect(lowpassFilter);
      
      osc2.connect(triangleGain);
      triangleGain.connect(lowpassFilter);

      lowpassFilter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Start all oscillators
      osc1.start();
      osc2.start();
      lfo.start();
    } catch (e) {
      console.warn("Failed to initialize Web Audio synth:", e);
    }
  };

  // Sync state (frequency, LFO speed, and volume)
  useEffect(() => {
    if (enabled) {
      initAudio();
      
      const ctx = audioCtxRef.current;
      if (ctx) {
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const now = ctx.currentTime;
        // Smooth parameter ramps to avoid speaker popping
        if (oscRef.current) {
          oscRef.current.frequency.exponentialRampToValueAtTime(baseFrequency, now + 0.1);
        }
        if (osc2Ref.current) {
          osc2Ref.current.frequency.exponentialRampToValueAtTime(baseFrequency * 1.5 + 1.2, now + 0.1);
        }
        if (lfoRef.current) {
          lfoRef.current.frequency.setValueAtTime(Math.max(0.05, 0.2 * waveSpeed), now);
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.linearRampToValueAtTime(volume * 0.15, now + 0.2); // keep soft & cinematic
        }
      }
    } else {
      const ctx = audioCtxRef.current;
      if (ctx && gainNodeRef.current) {
        // Ramp down smoothly when disabled
        gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      }
    }
  }, [enabled, baseFrequency, volume, waveSpeed]);

  // Clean up nodes on unmount
  useEffect(() => {
    return () => {
      try {
        if (oscRef.current) oscRef.current.stop();
        if (osc2Ref.current) osc2Ref.current.stop();
        if (lfoRef.current) lfoRef.current.stop();
        if (audioCtxRef.current) audioCtxRef.current.close();
      } catch (e) {
        // Safe swallow
      }
    };
  }, []);

  return {
    triggerActivation: () => {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    }
  };
}
