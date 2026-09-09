import React, { useState, useEffect, useRef } from 'react';
import { Zap, ChevronRight, Flame, FastForward, Trophy, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export default function IntroSplash({ onComplete }) {
  const [scene, setScene] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speedTelemetry, setSpeedTelemetry] = useState(0);
  const [stageText, setStageText] = useState('CAR STORY PISTON CUP IGNITION...');
  const [animationCompleted, setAnimationCompleted] = useState(false);
  
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const animKeyRef = useRef(0);

  // Web Audio API: Piston Cup NASCAR V8 High-Rev Engine & Trackside Flyby Sound
  useEffect(() => {
    if (!soundEnabled || scene !== 1) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;

      // 1. NASCAR V8 Stock Car Engine Sub-Rumble (42Hz -> 320Hz)
      const nascarSubOsc = ctx.createOscillator();
      const nascarSubGain = ctx.createGain();
      nascarSubOsc.type = 'sawtooth';
      nascarSubOsc.frequency.setValueAtTime(42, now);
      nascarSubOsc.frequency.linearRampToValueAtTime(180, now + 1.8);
      nascarSubOsc.frequency.linearRampToValueAtTime(480, now + 3.2);

      const nascarSubFilter = ctx.createBiquadFilter();
      nascarSubFilter.type = 'lowpass';
      nascarSubFilter.frequency.setValueAtTime(280, now);
      nascarSubFilter.frequency.linearRampToValueAtTime(950, now + 3.2);

      nascarSubGain.gain.setValueAtTime(0.01, now);
      nascarSubGain.gain.linearRampToValueAtTime(0.38, now + 0.6);
      nascarSubGain.gain.linearRampToValueAtTime(0.55, now + 3.0);
      nascarSubGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

      nascarSubOsc.connect(nascarSubFilter);
      nascarSubFilter.connect(nascarSubGain);
      nascarSubGain.connect(ctx.destination);
      nascarSubOsc.start();

      // 2. High-Rev Combustion Chamber Tone (Square Wave with Bandpass Filter)
      const nascarMidOsc = ctx.createOscillator();
      const nascarMidGain = ctx.createGain();
      nascarMidOsc.type = 'square';
      nascarMidOsc.frequency.setValueAtTime(84, now);
      nascarMidOsc.frequency.linearRampToValueAtTime(360, now + 1.8);
      nascarMidOsc.frequency.linearRampToValueAtTime(960, now + 3.2);

      const nascarMidFilter = ctx.createBiquadFilter();
      nascarMidFilter.type = 'bandpass';
      nascarMidFilter.frequency.setValueAtTime(450, now);
      nascarMidFilter.frequency.linearRampToValueAtTime(1400, now + 3.2);
      nascarMidFilter.Q.value = 1.8;

      nascarMidGain.gain.setValueAtTime(0.01, now);
      nascarMidGain.gain.linearRampToValueAtTime(0.28, now + 0.8);
      nascarMidGain.gain.linearRampToValueAtTime(0.45, now + 3.0);
      nascarMidGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

      nascarMidOsc.connect(nascarMidFilter);
      nascarMidFilter.connect(nascarMidGain);
      nascarMidGain.connect(ctx.destination);
      nascarMidOsc.start();

      // 3. Piston Cup Trackside Gearshift Backfire Pops
      const triggerExhaustPop = (delayMs) => {
        setTimeout(() => {
          if (ctx.state === 'closed') return;
          const popOsc = ctx.createOscillator();
          const popGain = ctx.createGain();
          popOsc.type = 'triangle';
          popOsc.frequency.setValueAtTime(160, ctx.currentTime);
          popOsc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.12);

          popGain.gain.setValueAtTime(0.7, ctx.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

          popOsc.connect(popGain);
          popGain.connect(ctx.destination);
          popOsc.start();
        }, delayMs);
      };

      triggerExhaustPop(1400);
      triggerExhaustPop(2700);

      // 4. Low-Frequency Rubber Track Friction
      setTimeout(() => {
        if (ctx.state === 'closed') return;
        const bufLen = ctx.sampleRate * 1.3;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;

        const screechSrc = ctx.createBufferSource();
        screechSrc.buffer = buf;
        const sFilter = ctx.createBiquadFilter();
        sFilter.type = 'bandpass';
        sFilter.frequency.value = 2200;
        sFilter.Q.value = 3.0;

        const sGain = ctx.createGain();
        sGain.gain.setValueAtTime(0.01, ctx.currentTime);
        sGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
        sGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        screechSrc.connect(sFilter);
        sFilter.connect(sGain);
        sGain.connect(ctx.destination);
        screechSrc.start();
      }, 1200);

    } catch (e) {
      console.warn('Audio Context error:', e);
    }

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [soundEnabled, scene, animKeyRef.current]);

  // Main Canvas Render Loop (Piston Cup Stadium Lighting, Spinning Wheels, Exhaust Flames & Manual Navigation)
  useEffect(() => {
    if (scene !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let startTime = null;

    const carImg = new Image();
    carImg.src = '/images/porsche_gt3rs_isolated.png';

    const smokeParticles = [];
    const sparkParticles = [];
    const flameParticles = [];

    const addSmoke = (x, y) => {
      smokeParticles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.7) * 3,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        radius: Math.random() * 8 + 6,
        maxRadius: Math.random() * 35 + 25,
        alpha: 0.5,
        growth: Math.random() * 0.6 + 0.3,
        color: 'rgba(210, 220, 240,'
      });
    };

    const addSpark = (x, y) => {
      sparkParticles.push({
        x,
        y,
        vx: (Math.random() - 0.85) * 9,
        vy: (Math.random() - 0.6) * 6 - 2,
        size: Math.random() * 2.5 + 1,
        alpha: 1,
        color: '#ffcc00'
      });
    };

    const addFlame = (x, y, speed) => {
      for (let i = 0; i < 5; i++) {
        flameParticles.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 4,
          vx: -Math.random() * (speed * 0.12 + 10) - 5,
          vy: (Math.random() - 0.5) * 4,
          radius: Math.random() * 12 + 5,
          alpha: 1,
          hue: Math.random() > 0.4 ? 25 : 190
        });
      }
    };

    let wheelAngle = 0;

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, width, height);

      const roadY = height * 0.76;
      let x = -300;
      let y = roadY - 20;
      let bodyAngle = 0;
      let rcScale = 0.35;
      let carSpeed = 0;
      let isFlaming = false;

      if (elapsed < 0.6) {
        setStageText('PISTON CUP DARKNESS... NASCAR V8 IDLE');
        setSpeedTelemetry(0);
      } else if (elapsed >= 0.6 && elapsed < 1.1) {
        setStageText('CAR STORY CHAMPIONSHIP • HEADLIGHT IGNITION');
        x = width * 0.18;
        y = roadY - 20;
        bodyAngle = -0.04;
        setSpeedTelemetry(Math.floor(Math.random() * 6));
        wheelAngle += 0.04;
      } else if (elapsed >= 1.1 && elapsed < 2.6) {
        setStageText('PISTON CUP TURN 4 DRIFT • NASCAR V8 ROAR');
        const progress = (elapsed - 1.1) / 1.5;

        const p0 = { x: width * 0.12, y: roadY };
        const p1 = { x: width * 0.36, y: roadY - 120 };
        const p2 = { x: width * 0.60, y: roadY - 15 };

        x = (1 - progress) * (1 - progress) * p0.x + 2 * (1 - progress) * progress * p1.x + progress * progress * p2.x;
        y = (1 - progress) * (1 - progress) * p0.y + 2 * (1 - progress) * progress * p1.y + progress * progress * p2.y;

        bodyAngle = -0.40 + progress * 0.46;
        rcScale = 0.32 + progress * 0.06;

        carSpeed = Math.floor(35 + progress * 80);
        setSpeedTelemetry(carSpeed);
        wheelAngle += carSpeed * 0.2;

        const rearWheelX = x - 60 * rcScale;
        const rearWheelY = y + 15 * rcScale;
        addSmoke(rearWheelX, rearWheelY);
        if (Math.random() > 0.3) addSpark(rearWheelX, rearWheelY + 8);
        if (elapsed > 1.4 && elapsed < 1.7) isFlaming = true;

      } else if (elapsed >= 2.6) {
        setStageText('CHAMPIONSHIP ROCKET LAUNCH • PISTON CUP FLYBY');
        isFlaming = true;
        const progress = Math.min((elapsed - 2.6) / 1.1, 1.2);
        const easeNOS = progress * progress * progress * 2.5;

        x = width * 0.60 + easeNOS * (width * 0.78);
        y = roadY - 15 - easeNOS * 40;

        bodyAngle = 0.03;
        rcScale = 0.38 + easeNOS * 0.08;

        carSpeed = Math.floor(110 + easeNOS * 155);
        setSpeedTelemetry(carSpeed);
        wheelAngle += carSpeed * 0.4;

        const rearWheelX = x - 70 * rcScale;
        const rearWheelY = y + 15 * rcScale;
        addSmoke(rearWheelX, rearWheelY);
      }

      // Render Particles
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.radius += p.growth;
        p.alpha -= 0.018;

        if (p.alpha <= 0 || p.radius >= p.maxRadius) {
          smokeParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = sparkParticles.length - 1; i >= 0; i--) {
        const p = sparkParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.035;

        if (p.alpha <= 0) {
          sparkParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw Car + Spinning Wheels + Flames
      if (carImg.complete && elapsed >= 0.6 && x > -400 && x < width + 500) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(bodyAngle);

        const drawW = carImg.width * rcScale;
        const drawH = carImg.height * rcScale;

        ctx.drawImage(carImg, -drawW / 2, -drawH / 2, drawW, drawH);

        const frontWheelX = drawW * 0.27;
        const rearWheelX = -drawW * 0.27;
        const wheelY = drawH * 0.16;
        const wheelRadius = drawH * 0.22;

        [frontWheelX, rearWheelX].forEach((wx) => {
          ctx.save();
          ctx.translate(wx, wheelY);
          ctx.rotate(wheelAngle);

          ctx.fillStyle = '#ff3300';
          ctx.beginPath();
          ctx.arc(0, 0, wheelRadius * 0.75, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#eeeeee';
          ctx.lineWidth = 2.5;
          for (let s = 0; s < 5; s++) {
            const spokeAng = (s * Math.PI * 2) / 5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(spokeAng) * (wheelRadius * 0.8), Math.sin(spokeAng) * (wheelRadius * 0.8));
            ctx.stroke();
          }

          ctx.restore();
        });

        const exhaustX = -drawW * 0.46;
        const exhaustY = drawH * 0.14;

        if (isFlaming) {
          addFlame(x + exhaustX, y + exhaustY, carSpeed);
        }

        ctx.restore();
      }

      // Render Flame Particles
      for (let i = flameParticles.length - 1; i >= 0; i--) {
        const f = flameParticles[i];
        f.x += f.vx;
        f.y += f.vy;
        f.radius -= 0.4;
        f.alpha -= 0.045;

        if (f.alpha <= 0 || f.radius <= 0) {
          flameParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `hsla(${f.hue}, 100%, 65%, ${f.alpha})`;
        ctx.shadowColor = `hsl(${f.hue}, 100%, 50%)`;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (elapsed >= 3.8 && !animationCompleted) {
        setAnimationCompleted(true);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scene, animKeyRef.current]);

  const handleNextStage = () => {
    setScene(2);
  };

  const handleReplay = () => {
    setAnimationCompleted(false);
    animKeyRef.current += 1;
  };

  const handleEnterBattlegroundClick = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white font-sans overflow-hidden select-none flex flex-col justify-between">
      
      {/* SCENE 1: Car Story Piston Cup Racing Sequence */}
      {scene === 1 && (
        <>
          <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full block bg-black" />

          {/* Header HUD */}
          <div className="relative z-20 p-6 sm:p-8 flex justify-between items-start font-mono text-xs text-zinc-400">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white text-black font-black text-xl flex items-center justify-center font-mono">
                RC
              </div>
              <div>
                <div className="text-white font-bold text-sm tracking-widest uppercase">RC BATTLEGROUND</div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest animate-pulse font-bold">
                  {stageText}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center space-x-1.5 bg-zinc-900/90 border border-zinc-700 px-3 py-1.5 text-xs text-white hover:bg-zinc-800 font-mono"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                <span>{soundEnabled ? 'CAR STORY V8 SOUND ON' : 'MUTED'}</span>
              </button>

              <div className="inline-flex items-center space-x-2 bg-zinc-900/90 border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="font-bold text-sm">{speedTelemetry} MPH</span>
              </div>
            </div>
          </div>

          {/* Center Title */}
          <div className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-4 my-auto pointer-events-none">
            <div className="inline-flex items-center space-x-2 bg-white text-black font-mono font-black text-xs px-3 py-1 uppercase tracking-widest shadow-xl">
              <Zap className="w-4 h-4 fill-black" />
              <span>CAR STORY PISTON CUP CHAMPIONSHIP LAUNCH</span>
            </div>

            <h1 className="text-4xl sm:text-7xl font-black uppercase text-white tracking-tighter leading-none font-sans drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
              RC BATTLEGROUND
            </h1>

            <p className="text-zinc-300 text-xs sm:text-sm font-mono max-w-xl mx-auto tracking-widest uppercase drop-shadow-md">
              PISTON CUP RACING • SPINNING WHEELS • MANUAL STAGE COMMAND
            </p>
          </div>

          {/* Bottom Bar: Manual Command Buttons */}
          <div className="relative z-20 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center font-mono text-xs text-zinc-300 border-t border-zinc-900/80 bg-black/80 backdrop-blur-md gap-4">
            <div className="flex items-center space-x-2 text-zinc-400">
              <FastForward className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>MANUAL COMMAND REQUIRED TO ADVANCE STAGE</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleReplay}
                className="mono-btn-secondary py-2.5 px-4 text-xs font-bold uppercase flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>REPLAY CAR STORY ANIMATION</span>
              </button>

              <button
                onClick={handleNextStage}
                className="mono-btn-primary py-2.5 px-6 text-xs font-bold uppercase flex items-center space-x-2 shadow-lg shadow-white/10 hover:scale-105"
              >
                <span>PROCEED TO NEXT STAGE</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* SCENE 2: ARENA STAGE (Red Ferrari Arena) */}
      {scene === 2 && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between animate-fadeIn bg-black">
          
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/images/ferrari_facing_right_bg.jpg"
              alt="Red Ferrari Facing Right Side"
              className="w-full h-full object-cover animate-bg-reveal filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)]" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 flex justify-between items-start font-mono text-xs text-zinc-400">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white text-black font-black text-xl flex items-center justify-center font-mono">
                RC
              </div>
              <div>
                <div className="text-white font-bold text-sm tracking-widest uppercase">RC BATTLEGROUND</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest">RED FERRARI ARENA STAGE</div>
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center space-x-2 bg-zinc-900/90 border border-zinc-700 px-3 py-1 text-xs text-white font-mono">
              <Trophy className="w-4 h-4 text-white" />
              <span>STAGE 2 UNLOCKED</span>
            </div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 my-auto">
            <div className="inline-flex items-center space-x-2 bg-white text-black font-mono font-black text-xs px-4 py-1.5 uppercase tracking-widest">
              <Zap className="w-4 h-4 fill-black" />
              <span>ARENA UNLOCKED</span>
            </div>

            <h1 className="text-5xl sm:text-8xl font-black uppercase text-white tracking-tight leading-none font-sans drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
              ENTER THE BATTLEGROUND
            </h1>

            <p className="text-zinc-200 text-sm sm:text-base font-mono max-w-2xl mx-auto tracking-wider uppercase drop-shadow-md">
              PREMIER MARKETPLACE FOR RC DRIFT CARS, F1 FORMULA SUPERCAR RACERS, AND MONSTER TRUCKS
            </p>

            <div className="pt-6">
              <button
                onClick={handleEnterBattlegroundClick}
                className="mono-btn-primary py-5 px-12 text-sm sm:text-base font-black tracking-widest uppercase inline-flex items-center space-x-4 shadow-[0_20px_50px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 hover:bg-zinc-200 border-2 border-white"
              >
                <span>ENTER THE BATTLEGROUND</span>
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center font-mono text-[11px] text-zinc-400 border-t border-zinc-900/80 bg-black/60 backdrop-blur-sm space-y-2 sm:space-y-0">
            <div>BACKGROUND: RED FERRARI RC SUPERCAR ARENA</div>
            <div className="flex space-x-6">
              <span className="text-white font-bold">CLICK BUTTON TO ENTER HOMEPAGE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
