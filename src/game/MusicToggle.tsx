import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Generative ambient music using Web Audio API — no external dependency,
 * no API key, instant on/off. Plays a slow, evolving lo-fi pad.
 */
export function MusicToggle() {
  const [on, setOn] = React.useState(false);
  const ctxRef = React.useRef<AudioContext | null>(null);
  const nodesRef = React.useRef<{ stop: () => void } | null>(null);

  React.useEffect(() => {
    return () => {
      nodesRef.current?.stop();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const start = async () => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;

    // Browsers require an explicit resume tied to the user gesture
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // ignore
      }
    }

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 1.2);

    // Lowpass for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.9;
    filter.connect(master);

    // A minor 9 pad: A2, C3, E3, G3, B3, A4 — richer, brighter
    const freqs = [110, 130.81, 164.81, 196, 246.94, 440];
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 === 0 ? "triangle" : "sawtooth";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.55 / freqs.length;
      // Slight detune drift
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.1 + i * 0.03;
      lfoGain.gain.value = 4;
      lfo.connect(lfoGain);
      lfoGain.connect(o.detune);
      o.connect(g);
      g.connect(filter);
      o.start();
      lfo.start();
      oscs.push(o, lfo);
      gains.push(g);
    });

    // Slow filter sweep for movement
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.frequency.value = 0.08;
    sweepGain.gain.value = 600;
    sweep.connect(sweepGain);
    sweepGain.connect(filter.frequency);
    sweep.start();
    oscs.push(sweep);

    // Gentle arpeggio for engagement
    const arpFreqs = [261.63, 329.63, 392, 523.25, 392, 329.63];
    const arpGain = ctx.createGain();
    arpGain.gain.value = 0;
    arpGain.connect(filter);
    const arp = ctx.createOscillator();
    arp.type = "sine";
    arp.connect(arpGain);
    arp.start();
    oscs.push(arp);
    let step = 0;
    const arpInterval = window.setInterval(() => {
      const t = ctx.currentTime;
      const f = arpFreqs[step % arpFreqs.length];
      arp.frequency.setValueAtTime(f, t);
      arpGain.gain.cancelScheduledValues(t);
      arpGain.gain.setValueAtTime(0.0001, t);
      arpGain.gain.exponentialRampToValueAtTime(0.18, t + 0.05);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      step++;
    }, 650);

    nodesRef.current = {
      stop: () => {
        try {
          clearInterval(arpInterval);
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
          setTimeout(() => {
            oscs.forEach((o) => {
              try {
                o.stop();
              } catch {
                // ignore
              }
            });
            ctx.close().catch(() => {});
          }, 700);
        } catch {
          // ignore
        }
      },
    };
  };

  const toggle = async () => {
    if (on) {
      nodesRef.current?.stop();
      nodesRef.current = null;
      ctxRef.current = null;
      setOn(false);
    } else {
      try {
        await start();
        setOn(true);
      } catch {
        // ignore
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={on ? "Mute ambient music" : "Play ambient music"}
      className="rounded-full"
    >
      {on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </Button>
  );
}