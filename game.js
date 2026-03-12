"use strict";

(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const scoreValue = document.getElementById("scoreValue");
  const comboValue = document.getElementById("comboValue");
  const stageValue = document.getElementById("stageValue");
  const pauseButton = document.getElementById("pauseButton");
  const startGameButton = document.getElementById("startGameButton");
  const primaryActionButton = document.getElementById("primaryActionButton");
  const secondaryActionButton = document.getElementById("secondaryActionButton");
  const homeActionButton = document.getElementById("homeActionButton");
  const titleScreen = document.getElementById("titleScreen");
  const stateScreen = document.getElementById("stateScreen");
  const stateKicker = document.getElementById("stateKicker");
  const stateTitle = document.getElementById("stateTitle");
  const stateMessage = document.getElementById("stateMessage");
  const currentBubblePreview = document.getElementById("currentBubblePreview");
  const nextBubblePreview = document.getElementById("nextBubblePreview");
  const statusText = document.getElementById("statusText");
  const stageFlavorText = document.getElementById("stageFlavorText");
  const descentMeter = document.getElementById("descentMeter");
  const boardStage = document.getElementById("boardStage");
  const appShell = document.getElementById("appShell");
  const gameCard = document.getElementById("gameCard");
  const boardHeader = document.getElementById("boardHeader");
  const canvasFrame = document.getElementById("canvasFrame");
  const launcherPanel = document.getElementById("launcherPanel");
  const hud = document.querySelector(".hud");

  const CONFIG = {
    viewWidth: 420,
    viewHeight: 700,
    fieldLeft: 18,
    fieldRight: 402,
    topPadding: 72,
    bubbleRadius: 22,
    columns: 8,
    rowStep: 38,
    descendIntervalMs: 12000,
    descendHalfStep: 19,
    descendPenaltyStep: 38,
    missLimit: 5,
    projectileSpeed: 760,
    launcherX: 210,
    launcherY: 632,
    dangerLineY: 534,
    boardSearchRows: 20,
    colors: ["#ff6b6b", "#ffd166", "#4ecdc4", "#5f7bff", "#c77dff"],
  };

  canvas.width = CONFIG.viewWidth;
  canvas.height = CONFIG.viewHeight;

  const BUBBLE_DIAMETER = CONFIG.bubbleRadius * 2;
  const GRID_START_X = (CONFIG.viewWidth - (CONFIG.columns * BUBBLE_DIAMETER + CONFIG.bubbleRadius)) / 2 + CONFIG.bubbleRadius;

  const TOTAL_STAGES = 20;
  const CHAPTER_THEMES = [
    "\uC624\uD504\uB2DD \uD30C\uB3D9",
    "\uBBF8\uB7EC \uB9AC\uB4EC",
    "\uD504\uB9AC\uC998 \uB77C\uBCF4",
    "\uD53C\uB0A0\uB808 \uB7EC\uC2DC",
  ];
  const BOSS_PROFILES = [
    {
      name: "\uD06C\uB9AC\uD37C",
      kind: "creeper",
      accent: "#7cff6f",
      secondary: "#234b28",
      aura: "rgba(125, 255, 142, 0.34)",
    },
    {
      name: "\uD55C\uB2C8\uBC1C \uB809\uD130",
      kind: "hannibal",
      accent: "#ffb173",
      secondary: "#6b211f",
      aura: "rgba(255, 166, 108, 0.32)",
      expressions: ["cold", "glare", "smirk", "amused"],
      portraitPath: "assets/bosses/hannibal-face.png",
    },
    {
      name: "\uC708\uD130",
      kind: "winter",
      accent: "#9edfff",
      secondary: "#bfd3ff",
      aura: "rgba(173, 231, 255, 0.34)",
      expressions: ["smile", "wink", "focus", "surprised"],
      portraitPath: "assets/bosses/winter-face.png",
    },
    {
      name: "\uACE0\uC2A4\uD2B8\uD398\uC774\uC2A4",
      kind: "ghostface",
      accent: "#f0f3ff",
      secondary: "#1e2237",
      aura: "rgba(223, 227, 255, 0.28)",
    },
  ];
  const BOSS_NAMES = BOSS_PROFILES.map((profile) => profile.name);
  const BOSS_ACTION_TEXT = {
    recolor: "\uC0C9 \uAD50\uB780",
    add: "\uBC84\uBE14 \uCD94\uAC00",
    shuffle: "\uBC30\uCE58 \uAD50\uB780",
  };
  const BOSS_DIALOGUES = {
    creeper: {
      kicker: "Boss Alert",
      intro: "크리퍼가 버블 벽 위에서 쉭쉭거리며 폭발 타이밍을 재고 있어요.",
      ability: "색을 뒤틀고 빈 칸에 버블을 심으면서 배치를 통째로 헝클어뜨리려 합니다.",
      entryStatus: "크리퍼의 폭발 리듬보다 정확한 각도가 먼저예요.",
      clear: "크리퍼의 폭발 패턴을 읽어내고 버블 벽을 다시 장악했어요.",
      enterPopup: "CREEPER",
      taunts: {
        recolor: [
          "쉬익... 색부터 바꿔버릴게.",
          "방금 외운 색은 이제 틀렸어.",
        ],
        add: [
          "한 칸 더 심어둘게.",
          "버블 하나 더. 길을 막아볼까?",
        ],
        shuffle: [
          "픽셀 길 전체를 갈아엎는다!",
          "방금 외운 배치는 잊어버려.",
        ],
      },
    },
    hannibal: {
      kicker: "Boss Cinema",
      intro: "한니발 렉터가 차갑게 미소 지으며 판을 해체할 준비를 마쳤어요.",
      ability: "정교한 색 교란과 배치 교란으로 리듬을 무너뜨리려 합니다.",
      entryStatus: "침착하게 각도만 지키면 한니발의 심리전도 흔들 수 있어요.",
      clear: "한니발 렉터의 심리전 속에서도 샷 리듬을 끝까지 지켜냈어요.",
      enterPopup: "LECTER",
      taunts: {
        recolor: [
          "색의 질서를 조금 바꿔보죠.",
          "이 한 수로 흐름이 흐트러질 겁니다.",
        ],
        add: [
          "판 위에 한 수를 더 올려두죠.",
          "빈 자리도 전부 계획 안에 있었습니다.",
        ],
        shuffle: [
          "배치가 무너지면 판단도 흐려집니다.",
          "지금부터는 눈이 아니라 리듬으로 쌓아야 해요.",
        ],
      },
    },
    winter: {
      kicker: "Boss Stage",
      intro: "윈터가 반짝이는 미소로 버블 흐름을 흔들 준비를 끝냈어요.",
      ability: "빠른 표정 변화와 반짝이는 교란으로 예측을 흔듭니다.",
      entryStatus: "리듬만 놓치지 않으면 반짝이는 페인트도 돌파할 수 있어요.",
      clear: "윈터의 화려한 교란 속에서도 템포를 끝까지 지켜냈어요.",
      enterPopup: "WINTER",
      taunts: {
        recolor: [
          "반짝이는 색으로 다시 섞어볼게!",
          "이번엔 조금 더 화려하게 흔들어볼게.",
        ],
        add: [
          "버블 하나 더! 리듬 흔들 준비됐지?",
          "빈 자리도 잠깐 채워둘게.",
        ],
        shuffle: [
          "배치를 살짝 꼬아볼게!",
          "지금부터는 순간 반응이야.",
        ],
      },
    },
    ghostface: {
      kicker: "Final Boss",
      intro: "고스트페이스가 조용히 떠오르며 마지막 보스전을 공포감으로 덮고 있어요.",
      ability: "그림자 잔상과 비명 파동으로 마지막 배치를 계속 뒤틀어놓습니다.",
      entryStatus: "마지막까지 침착하면 고스트페이스의 공포 연출도 버틸 수 있어요.",
      clear: "고스트페이스의 공포 연출을 뚫고 최종 보스를 제압했어요.",
      enterPopup: "SCREAM",
      taunts: {
        recolor: [
          "다음 색을 믿은 순간 틀렸어.",
          "정답이었던 색은 이미 사라졌어.",
        ],
        add: [
          "비어 있던 자리도 안전하지 않아.",
          "조용히 하나 더 남겨두지.",
        ],
        shuffle: [
          "어느 위치가 진짜인지 맞혀봐.",
          "방금 본 배치는 이미 다른 모습이야.",
        ],
      },
    },
  };
  const MISS_LINES = [
    "이번 샷은 아쉽지만 아직 흐름은 살아 있어요.",
    "각도를 조금만 더 다듬으면 바로 터질 것 같아요.",
    "다음 한 발이 하이라이트가 될 수도 있어요.",
  ];


  let responsiveLayoutFrame = 0;
  let audioContext = null;
  let noiseBuffer = null;

  const state = {
    mode: "title",
    stage: 1,
    score: 0,
    combo: 0,
    missStreak: 0,
    boardOffsetY: 0,
    descendElapsed: 0,
    descendIntervalMs: CONFIG.descendIntervalMs,
    board: [],
    currentBubble: null,
    nextBubble: null,
    projectile: null,
    aiming: false,
    aimAngle: -Math.PI / 2,
    particles: [],
    popups: [],
    boss: null,
    flashLevel: 0,
    stageClearQueued: false,
    stageClearTimerId: 0,
    overlayPrimaryAction: "resume",
    overlaySecondaryAction: "restart",
    animationFrameId: 0,
    lastTime: 0,
  };

  function createSeededRandom(seed) {
    let value = seed >>> 0;
    return function next() {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function readPx(styles, propertyName) {
    return parseFloat(styles[propertyName]) || 0;
  }

  function getViewportSize() {
    const viewport = window.visualViewport;
    return {
      width: Math.round(viewport ? viewport.width : window.innerWidth),
      height: Math.round(viewport ? viewport.height : window.innerHeight),
    };
  }

  function syncResponsiveLayout() {
    if (!appShell || !gameCard || !hud || !boardHeader || !canvasFrame || !launcherPanel) {
      return;
    }

    const viewportSize = getViewportSize();
    const isPhonePortrait = viewportSize.width <= 640 && viewportSize.height >= viewportSize.width;
    const isWideDesktop = !isPhonePortrait && viewportSize.width >= 960;
    const layoutMode = isPhonePortrait ? "phone-portrait" : isWideDesktop ? "desktop-wide" : "desktop-compact";

    document.body.dataset.layout = layoutMode;
    canvas.style.width = "";
    canvas.style.height = "";

    const frameStyles = getComputedStyle(canvasFrame);
    const frameInnerWidth =
      canvasFrame.clientWidth - readPx(frameStyles, "paddingLeft") - readPx(frameStyles, "paddingRight");
    const frameInnerHeight =
      canvasFrame.clientHeight - readPx(frameStyles, "paddingTop") - readPx(frameStyles, "paddingBottom");

    if (frameInnerWidth <= 0 || frameInnerHeight <= 0) {
      return;
    }

    const naturalAspect = CONFIG.viewHeight / CONFIG.viewWidth;
    const targetWidth = Math.min(frameInnerWidth, frameInnerHeight / naturalAspect);
    const targetHeight = targetWidth * naturalAspect;

    canvas.style.width = `${Math.floor(targetWidth)}px`;
    canvas.style.height = `${Math.floor(targetHeight)}px`;
  }

  function requestResponsiveLayout() {
    if (responsiveLayoutFrame) {
      return;
    }
    responsiveLayoutFrame = window.requestAnimationFrame(() => {
      responsiveLayoutFrame = 0;
      syncResponsiveLayout();
    });
  }

  function getAudioContext() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      return null;
    }
    if (!audioContext) {
      audioContext = new AudioCtor();
    }
    return audioContext;
  }

  function unlockAudio() {
    const ctx = getAudioContext();
    if (!ctx) {
      return null;
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function getNoiseBuffer(ctx) {
    if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) {
      return noiseBuffer;
    }
    const duration = 0.2;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    }
    noiseBuffer = buffer;
    return buffer;
  }

  function scheduleTone(ctx, options) {
    const start = Math.max(ctx.currentTime, options.start ?? ctx.currentTime);
    const duration = options.duration ?? 0.12;
    const frequency = Math.max(50, options.frequency ?? 440);
    const frequencyEnd = Math.max(50, options.frequencyEnd ?? frequency);
    const peakGain = Math.max(0.0001, options.gain ?? 0.04);
    const endGain = Math.max(0.0001, options.gainEnd ?? 0.0001);
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = options.type ?? "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    if (frequencyEnd !== frequency) {
      oscillator.frequency.exponentialRampToValueAtTime(frequencyEnd, start + duration);
    }

    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(peakGain, start + Math.min(0.02, duration * 0.35));
    gainNode.gain.exponentialRampToValueAtTime(endGain, start + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function scheduleNoise(ctx, options) {
    const start = Math.max(ctx.currentTime, options.start ?? ctx.currentTime);
    const duration = options.duration ?? 0.08;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    source.buffer = getNoiseBuffer(ctx);
    filter.type = options.filterType ?? "bandpass";
    filter.frequency.setValueAtTime(options.filterFrequency ?? 900, start);
    if (options.filterFrequencyEnd) {
      filter.frequency.exponentialRampToValueAtTime(options.filterFrequencyEnd, start + duration);
    }
    if (options.q) {
      filter.Q.setValueAtTime(options.q, start);
    }

    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(options.gain ?? 0.025, start + Math.min(0.015, duration * 0.4));
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(start);
    source.stop(start + duration + 0.03);
  }

  function playShotSound() {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    scheduleTone(ctx, {
      type: "triangle",
      start,
      duration: 0.11,
      frequency: 760,
      frequencyEnd: 300,
      gain: 0.05,
    });
    scheduleTone(ctx, {
      type: "sine",
      start: start + 0.015,
      duration: 0.08,
      frequency: 520,
      frequencyEnd: 210,
      gain: 0.022,
    });
  }

  function playMatchSound(matchCount, combo) {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    const hitCount = Math.min(4, Math.max(2, Math.floor(matchCount / 2) + 1));
    for (let index = 0; index < hitCount; index += 1) {
      const frequency = 360 + index * 110 + Math.min(combo, 4) * 22;
      scheduleTone(ctx, {
        type: "sine",
        start: start + index * 0.032,
        duration: 0.1,
        frequency,
        frequencyEnd: frequency * 1.18,
        gain: 0.036,
      });
    }
    if (combo > 1) {
      scheduleTone(ctx, {
        type: "triangle",
        start: start + 0.05,
        duration: 0.16,
        frequency: 680,
        frequencyEnd: 980,
        gain: 0.02,
      });
    }
  }

  function playDropSound(dropCount) {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    scheduleTone(ctx, {
      type: "triangle",
      start,
      duration: 0.16,
      frequency: 260,
      frequencyEnd: 120,
      gain: 0.038,
    });
    scheduleNoise(ctx, {
      start: start + 0.01,
      duration: 0.11,
      gain: Math.min(0.05, 0.018 + dropCount * 0.0025),
      filterFrequency: 520,
      filterFrequencyEnd: 240,
      q: 0.8,
    });
  }

  function playDescendSound(fromPenalty) {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    scheduleTone(ctx, {
      type: fromPenalty ? "sawtooth" : "triangle",
      start,
      duration: fromPenalty ? 0.22 : 0.16,
      frequency: fromPenalty ? 180 : 210,
      frequencyEnd: 90,
      gain: fromPenalty ? 0.05 : 0.03,
    });
    scheduleNoise(ctx, {
      start: start + 0.01,
      duration: fromPenalty ? 0.14 : 0.09,
      gain: fromPenalty ? 0.03 : 0.018,
      filterType: "lowpass",
      filterFrequency: fromPenalty ? 700 : 520,
      filterFrequencyEnd: 180,
    });
  }

  function playStageClearSound() {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((frequency, index) => {
      scheduleTone(ctx, {
        type: "triangle",
        start: start + index * 0.08,
        duration: 0.18,
        frequency,
        frequencyEnd: frequency * 1.04,
        gain: 0.03,
      });
    });
  }

  function playGameOverSound() {
    const ctx = unlockAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime;
    scheduleTone(ctx, {
      type: "sawtooth",
      start,
      duration: 0.24,
      frequency: 320,
      frequencyEnd: 150,
      gain: 0.036,
    });
    scheduleTone(ctx, {
      type: "triangle",
      start: start + 0.12,
      duration: 0.28,
      frequency: 180,
      frequencyEnd: 90,
      gain: 0.03,
    });
  }

  function getBossScript(boss = state.boss) {
    if (!boss) {
      return BOSS_DIALOGUES.creeper;
    }
    return BOSS_DIALOGUES[boss.kind] || BOSS_DIALOGUES.creeper;
  }

  function getBossActionLine(actionKey, boss = state.boss) {
    const script = getBossScript(boss);
    const pool = script.taunts[actionKey] || [];
    return pool.length > 0 ? randomFrom(pool) : `${boss ? boss.name : "\uBCF4\uC2A4"}\uAC00 \uD310\uC744 \uD754\uB4E4\uACE0 \uC788\uC5B4\uC694.`;
  }

  function playBossIntroSound(boss = state.boss) {
    const ctx = unlockAudio();
    if (!ctx || !boss) {
      return;
    }
    const start = ctx.currentTime;
    if (boss.kind === "creeper") {
      scheduleTone(ctx, { type: "square", start, duration: 0.16, frequency: 196, frequencyEnd: 156, gain: 0.05 });
      scheduleTone(ctx, { type: "square", start: start + 0.14, duration: 0.18, frequency: 156, frequencyEnd: 110, gain: 0.04 });
      scheduleNoise(ctx, { start: start + 0.03, duration: 0.2, gain: 0.022, filterFrequency: 1600, filterFrequencyEnd: 520, q: 0.9 });
      return;
    }
    if (boss.kind === "hannibal") {
      scheduleTone(ctx, { type: "triangle", start, duration: 0.26, frequency: 220, frequencyEnd: 170, gain: 0.042 });
      scheduleTone(ctx, { type: "sine", start: start + 0.07, duration: 0.16, frequency: 760, frequencyEnd: 540, gain: 0.015 });
      scheduleNoise(ctx, { start: start + 0.03, duration: 0.16, gain: 0.012, filterType: "bandpass", filterFrequency: 1320, filterFrequencyEnd: 900, q: 6 });
      return;
    }
    if (boss.kind === "winter") {
      [698, 932, 1244].forEach((frequency, index) => {
        scheduleTone(ctx, {
          type: index === 2 ? "sine" : "triangle",
          start: start + index * 0.06,
          duration: 0.16,
          frequency,
          frequencyEnd: frequency * 1.06,
          gain: 0.025,
        });
      });
      scheduleNoise(ctx, { start: start + 0.01, duration: 0.08, gain: 0.008, filterType: "highpass", filterFrequency: 2400, filterFrequencyEnd: 3400, q: 0.7 });
      return;
    }
    scheduleTone(ctx, { type: "sawtooth", start, duration: 0.28, frequency: 520, frequencyEnd: 110, gain: 0.028 });
    scheduleNoise(ctx, { start: start + 0.02, duration: 0.28, gain: 0.024, filterType: "bandpass", filterFrequency: 980, filterFrequencyEnd: 340, q: 0.8 });
    scheduleTone(ctx, { type: "sine", start: start + 0.15, duration: 0.22, frequency: 170, frequencyEnd: 82, gain: 0.016 });
  }

  function playBossActionSound(actionKey, boss = state.boss) {
    const ctx = unlockAudio();
    if (!ctx || !boss) {
      return;
    }
    const start = ctx.currentTime;
    const offset = actionKey === "recolor" ? 0 : actionKey === "add" ? 60 : 120;
    if (boss.kind === "creeper") {
      scheduleTone(ctx, { type: "square", start, duration: 0.11, frequency: 180 + offset, frequencyEnd: 120 + offset * 0.2, gain: 0.038 });
      scheduleNoise(ctx, { start: start + 0.01, duration: 0.09, gain: 0.018, filterFrequency: 1700, filterFrequencyEnd: 600, q: 1 });
      return;
    }
    if (boss.kind === "hannibal") {
      scheduleTone(ctx, { type: "triangle", start, duration: 0.12, frequency: 260 + offset * 0.35, frequencyEnd: 210, gain: 0.03 });
      scheduleTone(ctx, { type: "sine", start: start + 0.04, duration: 0.08, frequency: 720, frequencyEnd: 560, gain: 0.012 });
      return;
    }
    if (boss.kind === "winter") {
      scheduleTone(ctx, { type: "sine", start, duration: 0.1, frequency: 720 + offset, frequencyEnd: 980 + offset * 0.3, gain: 0.022 });
      scheduleTone(ctx, { type: "triangle", start: start + 0.03, duration: 0.08, frequency: 980 + offset * 0.4, frequencyEnd: 1180 + offset * 0.45, gain: 0.014 });
      return;
    }
    scheduleNoise(ctx, { start, duration: 0.12, gain: 0.02, filterType: "bandpass", filterFrequency: 860 - offset * 1.2, filterFrequencyEnd: 300, q: 0.75 });
    scheduleTone(ctx, { type: "sawtooth", start: start + 0.01, duration: 0.16, frequency: 360 - offset * 0.4, frequencyEnd: 130, gain: 0.018 });
  }

  function playBossDefeatSound(boss = state.boss) {
    const ctx = unlockAudio();
    if (!ctx || !boss) {
      return;
    }
    const start = ctx.currentTime + 0.12;
    if (boss.kind === "creeper") {
      scheduleTone(ctx, { type: "square", start, duration: 0.16, frequency: 130, frequencyEnd: 240, gain: 0.024 });
      scheduleNoise(ctx, { start: start + 0.02, duration: 0.1, gain: 0.014, filterFrequency: 900, filterFrequencyEnd: 2200, q: 0.6 });
      return;
    }
    if (boss.kind === "hannibal") {
      scheduleTone(ctx, { type: "triangle", start, duration: 0.18, frequency: 220, frequencyEnd: 330, gain: 0.024 });
      scheduleTone(ctx, { type: "sine", start: start + 0.1, duration: 0.14, frequency: 440, frequencyEnd: 554, gain: 0.014 });
      return;
    }
    if (boss.kind === "winter") {
      [660, 880, 1320].forEach((frequency, index) => {
        scheduleTone(ctx, { type: "sine", start: start + index * 0.05, duration: 0.12, frequency, frequencyEnd: frequency * 1.05, gain: 0.018 });
      });
      return;
    }
    scheduleTone(ctx, { type: "sawtooth", start, duration: 0.18, frequency: 180, frequencyEnd: 90, gain: 0.02 });
    scheduleTone(ctx, { type: "triangle", start: start + 0.14, duration: 0.14, frequency: 330, frequencyEnd: 420, gain: 0.016 });
  }

  function mixColor(hex, amount) {

    const base = hex.replace("#", "");
    const channels = [
      parseInt(base.slice(0, 2), 16),
      parseInt(base.slice(2, 4), 16),
      parseInt(base.slice(4, 6), 16),
    ];
    const mixWith = amount >= 0 ? 255 : 0;
    const strength = Math.abs(amount);
    const mixed = channels.map((channel) => Math.round(channel + (mixWith - channel) * strength));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
  }

  function randomFrom(array, randomFn = Math.random) {
    return array[Math.floor(randomFn() * array.length)];
  }

  const bossPortraitCache = new Map();

  function getBossPortraitImage(boss) {
    if (!boss || !boss.portraitPath) {
      return null;
    }

    const key = boss.portraitPath;
    if (!bossPortraitCache.has(key)) {
      const image = new Image();
      image.decoding = "async";
      image.src = key;
      bossPortraitCache.set(key, image);
    }
    return bossPortraitCache.get(key);
  }

  function createEmptyBoard(rows = CONFIG.boardSearchRows) {

    return Array.from({ length: rows }, () => Array(CONFIG.columns).fill(null));
  }

  function ensureRowExists(rowIndex) {
    while (state.board.length <= rowIndex) {
      state.board.push(Array(CONFIG.columns).fill(null));
    }
  }

  function getCellCenter(row, col) {
    return {
      x: GRID_START_X + col * BUBBLE_DIAMETER + (row % 2 === 1 ? CONFIG.bubbleRadius : 0),
      y: CONFIG.topPadding + row * CONFIG.rowStep + state.boardOffsetY,
    };
  }

  function getNeighbors(row, col) {
    const shared = [
      [row, col - 1],
      [row, col + 1],
    ];
    const diagonalOffsets = row % 2 === 0
      ? [[row - 1, col - 1], [row - 1, col], [row + 1, col - 1], [row + 1, col]]
      : [[row - 1, col], [row - 1, col + 1], [row + 1, col], [row + 1, col + 1]];

    return shared.concat(diagonalOffsets)
      .filter(([candidateRow, candidateCol]) => candidateRow >= 0 && candidateCol >= 0 && candidateCol < CONFIG.columns);
  }

  function getBubble(row, col) {
    if (row < 0 || row >= state.board.length || col < 0 || col >= CONFIG.columns) {
      return null;
    }
    return state.board[row][col];
  }

  function setBubble(row, col, bubble) {
    ensureRowExists(row);
    state.board[row][col] = bubble;
  }

  function getExistingColors() {
    const colors = new Set();
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        const bubble = state.board[row][col];
        if (bubble) {
          colors.add(bubble.color);
        }
      }
    }
    return colors.size > 0 ? Array.from(colors) : CONFIG.colors;
  }

  function createBubble(color) {
    return { color };
  }

  function pickBubbleColor() {
    return randomFrom(getExistingColors());
  }

  function isBossStage(stage) {
    return stage % 5 === 0;
  }

  function getBossLevel(stage) {
    return Math.floor(stage / 5);
  }

  function getSpeedTier(stage) {
    return Math.floor((stage - 1) / 5);
  }

  function getStageNumberLabel(stage) {
    return `${stage} / ${TOTAL_STAGES}`;
  }

  function getStageDescendInterval(stage) {
    return Math.max(7500, CONFIG.descendIntervalMs - getSpeedTier(stage) * 1500);
  }

  function getStageTheme(stage) {
    const chapterTheme = CHAPTER_THEMES[getSpeedTier(stage)] || CHAPTER_THEMES[CHAPTER_THEMES.length - 1];
    if (isBossStage(stage)) {
      return `\uBCF4\uC2A4 ${getBossLevel(stage)} - ${BOSS_NAMES[getBossLevel(stage) - 1]}`;
    }
    return `${chapterTheme} ${(stage - 1) % 5 + 1}`;
  }

  function isFinalStage(stage) {
    return stage >= TOTAL_STAGES;
  }

  function getStageLabel(stage) {
    return `Stage ${getStageNumberLabel(stage)} - ${getStageTheme(stage)}`;
  }

  function getStageStartMessage(stage) {
    if (isBossStage(stage)) {
      return `${BOSS_NAMES[getBossLevel(stage) - 1]} 보스가 등장했어요. 색 교란과 배치 교란을 버티며 버블 벽을 밀어내보세요.`;
    }
    if ((stage + 1) % 5 === 0) {
      return "이 라운드를 넘기면 바로 보스 스테이지예요. 각도를 더 정교하게 다듬어봐요.";
    }
    return `${getStageTheme(stage)} 시작! 리듬을 유지하며 버블 벽을 밀어내보세요.`;
  }

  function getUpcomingHint(stage) {
    if (isFinalStage(stage)) {
      return "마지막 스테이지에서는 최종 보스전과 엔딩이 기다리고 있어요.";
    }
    if (isBossStage(stage + 1)) {
      return `다음은 보스 스테이지예요. ${BOSS_NAMES[getBossLevel(stage + 1) - 1]}가 기다리고 있어요.`;
    }
    return `\uD604\uC7AC \uAD6C\uAC04\uC740 \uBC84\uBE14 \uBCBD \uD558\uAC15 \uC18D\uB3C4 ${Math.round(getStageDescendInterval(stage) / 100) / 10}\uCD08 \uD398\uC774\uC2A4\uB85C \uC720\uC9C0\uB3FC\uC694.`;
  }

  function getBossProfile(level) {
    return BOSS_PROFILES[clamp(level - 1, 0, BOSS_PROFILES.length - 1)];
  }

  function getBossActionDelay(level) {
    const min = Math.max(3.4, 7.8 - (level - 1) * 1.2);
    const max = Math.max(min + 0.8, 8.9 - (level - 1) * 1.35);
    return min + Math.random() * (max - min);
  }

  function getBossExpressionDelay(boss) {
    if (!boss || !boss.expressions || boss.expressions.length === 0) {
      return 99;
    }
    return boss.kind === "winter" ? 1.4 + Math.random() * 1.9 : 1.8 + Math.random() * 2.4;
  }

  function pickBossExpression(boss, actionKey = "") {
    if (!boss || !boss.expressions || boss.expressions.length === 0) {
      return "neutral";
    }

    if (boss.kind === "hannibal") {
      const mapped = {
        recolor: "glare",
        add: "cold",
        shuffle: "smirk",
      };
      if (mapped[actionKey]) {
        return mapped[actionKey];
      }
    }

    if (boss.kind === "winter") {
      const mapped = {
        recolor: "focus",
        add: "smile",
        shuffle: "surprised",
      };
      if (mapped[actionKey]) {
        return mapped[actionKey];
      }
    }

    const candidates = boss.expressions.filter((expression) => expression !== boss.expression);
    return randomFrom(candidates.length > 0 ? candidates : boss.expressions);
  }

  function createBossForStage(stage) {
    if (!isBossStage(stage)) {
      return null;
    }
    const level = getBossLevel(stage);
    const profile = getBossProfile(level);
    const expressions = profile.expressions || [];
    const boss = {
      level,
      name: profile.name,
      kind: profile.kind,
      accent: profile.accent,
      secondary: profile.secondary,
      auraColor: profile.aura,
      expressions,
      portraitPath: profile.portraitPath || "",
      expression: expressions.length > 0 ? randomFrom(expressions) : "neutral",
      expressionElapsed: 0,
      nextExpressionDelay: expressions.length > 0 ? getBossExpressionDelay({ kind: profile.kind, expressions }) : 99,
      effectAction: "",
      effectTimer: 0,
      pulse: 0,
      x: CONFIG.launcherX,
      direction: level % 2 === 0 ? -1 : 1,
      speed: 28 + level * 7,
      floatTime: Math.random() * Math.PI * 2,
      actionElapsed: 0,
      nextActionDelay: getBossActionDelay(level),
    };
    if (boss.portraitPath) {
      getBossPortraitImage(boss);
    }
    return boss;
  }

  function getStageFlavorLabel(stage) {
    return isBossStage(stage)
      ? `Boss Stage ${getBossLevel(stage)} - ${BOSS_NAMES[getBossLevel(stage) - 1]}`
      : `Normal Stage - ${getStageTheme(stage)}`;
  }

  function getComboCheer(combo) {
    if (combo >= 5) {
      return "하이라이트!";
    }
    if (combo >= 3) {
      return "콤보 타임!";
    }
    return "리듬 좋아요!";
  }

  function hideOverlay(element) {
    element.classList.remove("overlay-active");
  }

  function showElement(element) {
    element.classList.add("overlay-active");
  }

  function paintPreview(element, color) {
    element.style.background = `radial-gradient(circle at 30% 30%, ${mixColor(color, 0.6)}, ${color} 55%, ${mixColor(color, -0.35)})`;
  }

  function decodeUiText(message) {
    if (typeof message !== "string" || !message.includes("\\u")) {
      return message;
    }
    return message.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  function updateStatus(message) {
    statusText.textContent = decodeUiText(message);
    requestResponsiveLayout();
  }

  function updateLauncherPreview() {
    paintPreview(currentBubblePreview, state.currentBubble ? state.currentBubble.color : "#68708c");
    paintPreview(nextBubblePreview, state.nextBubble ? state.nextBubble.color : "#68708c");
  }

  function updateHud() {
    scoreValue.textContent = state.score.toLocaleString("ko-KR");
    comboValue.textContent = `${state.combo}`;
    stageValue.textContent = getStageNumberLabel(state.stage);
    pauseButton.disabled = state.mode === "title";
    pauseButton.textContent = decodeUiText(state.mode === "paused" ? "\uACC4\uC18D\uD558\uAE30" : "\uC77C\uC2DC\uC815\uC9C0");

    if (stageFlavorText) {
      stageFlavorText.textContent = decodeUiText(state.mode === "title"
        ? `20\uAC1C \uC2A4\uD14C\uC774\uC9C0 \uCC4C\uB9B0\uC9C0\uAC00 \uC900\uBE44 \uC911\uC774\uC5D0\uC694.`
        : getStageFlavorLabel(state.stage));
    }

    const descentProgress = state.mode === "title"
      ? 0
      : Math.min(state.descendElapsed / state.descendIntervalMs, 1);
    descentMeter.style.width = `${descentProgress * 100}%`;
  }

  function showOverlay(options) {
    stateKicker.textContent = decodeUiText(options.kicker);
    stateTitle.textContent = decodeUiText(options.title);
    stateMessage.textContent = decodeUiText(options.message);
    primaryActionButton.textContent = decodeUiText(options.primaryLabel);
    secondaryActionButton.textContent = decodeUiText(options.secondaryLabel);
    secondaryActionButton.style.display = options.secondaryLabel ? "inline-flex" : "none";
    homeActionButton.style.display = options.showHome === false ? "none" : "inline-flex";
    state.overlayPrimaryAction = options.primaryAction;
    state.overlaySecondaryAction = options.secondaryAction || "restart";
    showElement(stateScreen);
  }

  function showBossIntroCutscene(stage) {
    if (!state.boss) {
      return;
    }
    const boss = state.boss;
    const script = getBossScript(boss);
    state.mode = "bossIntro";
    addPopup(script.enterPopup || boss.name.toUpperCase(), CONFIG.launcherX, 152, boss.accent || "#ffd166");
    updateStatus(`${boss.name} \uB4F1\uC7A5! ${script.ability}`);
    showOverlay({
      kicker: script.kicker,
      title: `Stage ${getStageNumberLabel(stage)} - ${boss.name}`,
      message: `${script.intro} ${script.ability}`,
      primaryLabel: "\uBCF4\uC2A4\uC804 \uC2DC\uC791",
      primaryAction: "bossIntro",
      secondaryLabel: "",
      secondaryAction: "restart",
      showHome: false,
    });
    playBossIntroSound(boss);
  }

  function buildStage(stage) {
    const random = createSeededRandom(stage * 99173 + 17);
    const speedTier = getSpeedTier(stage);
    const bossStage = isBossStage(stage);
    const rows = bossStage ? 7 + speedTier : 6 + speedTier;
    const gapRate = bossStage ? 0.08 + speedTier * 0.012 : 0.12 + speedTier * 0.01;
    const patternMode = (stage - 1) % 4;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        let shouldFill = row < 2 || random() > gapRate;
        if (bossStage && row < 3) {
          shouldFill = true;
        }
        if (!shouldFill && row === rows - 1 && col % 2 === 0) {
          shouldFill = true;
        }
        if (!shouldFill) {
          continue;
        }

        let colorIndex;
        if (patternMode === 0) {
          colorIndex = (row + col + speedTier) % CONFIG.colors.length;
        } else if (patternMode === 1) {
          colorIndex = (row * 2 + Math.floor(col / 2) + speedTier) % CONFIG.colors.length;
        } else if (patternMode === 2) {
          colorIndex = Math.floor(random() * CONFIG.colors.length);
          if (col > 0 && random() < 0.42) {
            const leftBubble = getBubble(row, col - 1);
            if (leftBubble) {
              colorIndex = CONFIG.colors.indexOf(leftBubble.color);
            }
          }
        } else {
          const mirroredCol = CONFIG.columns - col - 1;
          colorIndex = (row + mirroredCol + Math.floor(random() * 2) + speedTier) % CONFIG.colors.length;
        }

        if (bossStage && row >= 3 && random() < 0.18) {
          colorIndex = (colorIndex + 1 + Math.floor(random() * 2)) % CONFIG.colors.length;
        }

        setBubble(row, col, createBubble(CONFIG.colors[colorIndex]));
      }
    }
  }

  function resetRun(stage = 1, preserveScore = false) {
    const boundedStage = clamp(stage, 1, TOTAL_STAGES);
    state.stage = boundedStage;
    state.score = preserveScore ? state.score : 0;
    state.combo = 0;
    state.missStreak = 0;
    state.boardOffsetY = 0;
    state.descendElapsed = 0;
    state.descendIntervalMs = getStageDescendInterval(boundedStage);
    state.projectile = null;
    state.aiming = false;
    state.flashLevel = 0;
    state.popups = [];
    state.particles = [];
    state.boss = createBossForStage(boundedStage);
    state.stageClearQueued = false;
    if (state.stageClearTimerId) {
      window.clearTimeout(state.stageClearTimerId);
      state.stageClearTimerId = 0;
    }
    state.board = createEmptyBoard();
    buildStage(boundedStage);
    state.currentBubble = createBubble(pickBubbleColor());
    state.nextBubble = createBubble(pickBubbleColor());
    state.mode = "playing";
    hideOverlay(titleScreen);
    hideOverlay(stateScreen);
    boardStage.classList.remove("warning", "shake");
    checkDangerState();
    updateHud();
    updateLauncherPreview();
    addPopup(`STAGE ${getStageNumberLabel(boundedStage)}`, CONFIG.launcherX, 126, isBossStage(boundedStage) ? "#ff8fab" : "#ffd166");

    if (isBossStage(boundedStage) && state.boss) {
      showBossIntroCutscene(boundedStage);
      return;
    }

    updateStatus(getStageStartMessage(boundedStage));
  }

  function togglePause() {
    if (state.mode === "title" || state.mode === "gameover" || state.mode === "clear" || state.mode === "bossIntro") {
      return;
    }
    if (state.mode === "paused") {
      state.mode = "playing";
      hideOverlay(stateScreen);
      updateStatus("다시 버블쇼 시작!");
      updateHud();
      return;
    }
    state.mode = "paused";
    state.aiming = false;
    showOverlay({
      kicker: "게임 일시정지",
      title: "잠깐 숨 고르기",
      message: "호흡을 고른 뒤 다시 이어가면 돼요.",
      primaryLabel: "계속하기",
      primaryAction: "resume",
      secondaryLabel: "다시하기",
      secondaryAction: "restart",
    });
    updateHud();
  }

  function triggerShake() {
    boardStage.classList.remove("shake");
    void boardStage.offsetWidth;
    boardStage.classList.add("shake");
    window.setTimeout(() => boardStage.classList.remove("shake"), 360);
  }

  function addPopup(text, x, y, color) {
    state.popups.push({ text: decodeUiText(text), x, y, color, life: 1 });
  }

  function addParticles(x, y, color, amount) {
    for (let index = 0; index < amount; index += 1) {
      const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.3;
      const speed = 70 + Math.random() * 130;
      const maxLife = 0.7 + Math.random() * 0.35;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color,
        life: maxLife,
        maxLife,
      });
    }
  }


  function getOccupiedCells(maxRow = state.board.length - 1) {
    const occupied = [];
    const rowLimit = Math.min(maxRow, state.board.length - 1);
    for (let row = 0; row <= rowLimit; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        const bubble = getBubble(row, col);
        if (bubble) {
          occupied.push({ row, col, bubble });
        }
      }
    }
    return occupied;
  }

  function getAttachableEmptyCells(maxRow) {
    const candidates = [];
    const rowLimit = Math.min(maxRow, state.board.length - 1);
    for (let row = 0; row <= rowLimit; row += 1) {
      ensureRowExists(row);
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col)) {
          continue;
        }
        const valid = row === 0 || getNeighbors(row, col).some(([nRow, nCol]) => Boolean(getBubble(nRow, nCol)));
        if (valid) {
          candidates.push({ row, col });
        }
      }
    }
    return candidates;
  }

  function getBossDrawPosition() {
    if (!state.boss) {
      return null;
    }
    const boss = state.boss;
    const visuals = getBossVisualConfig(boss);
    const phase = boss.floatTime;
    let x = boss.x;
    let y = Math.max(18, CONFIG.topPadding + state.boardOffsetY - visuals.lift) + Math.sin(phase) * 5;

    if (boss.kind === "creeper") {
      x += Math.sign(Math.sin(phase * 2.7)) * 2.4;
      y += Math.sign(Math.cos(phase * 3.1)) * 1.8;
    } else if (boss.kind === "hannibal") {
      y += Math.sin(phase * 0.7) * 2.4;
    } else if (boss.kind === "winter") {
      x += Math.sin(phase * 0.8) * 3.4;
      y += Math.cos(phase * 1.6) * 2.6;
    } else if (boss.kind === "ghostface") {
      x += Math.sin(phase * 1.1) * 4.8;
      y += Math.cos(phase * 1.8) * 3.4;
    }

    return { x, y };
  }

  function triggerBossPersonaEffect(actionKey) {
    if (!state.boss) {
      return;
    }
    const boss = state.boss;
    boss.effectAction = actionKey;
    boss.effectTimer = boss.kind === "ghostface" ? 1.15 : 0.95;
    boss.pulse = 1;
    playBossActionSound(actionKey, boss);

    if (boss.expressions && boss.expressions.length > 0) {
      boss.expression = pickBossExpression(boss, actionKey);
      boss.expressionElapsed = 0;
      boss.nextExpressionDelay = getBossExpressionDelay(boss);
    }

    const bossPosition = getBossDrawPosition();
    if (!bossPosition) {
      return;
    }

    if (boss.kind === "creeper") {
      addPopup("SSSS...", bossPosition.x, bossPosition.y - 48, boss.accent);
    } else if (boss.kind === "hannibal") {
      addPopup("CHECKMATE", bossPosition.x, bossPosition.y - 48, boss.accent);
    } else if (boss.kind === "winter") {
      addPopup("SPARK", bossPosition.x, bossPosition.y - 48, boss.accent);
    } else if (boss.kind === "ghostface") {
      addPopup("SCREAM", bossPosition.x, bossPosition.y - 52, "#f2f3ff");
    }
  }

  function bossRecolorBubble() {
    const occupied = getOccupiedCells(7 + getSpeedTier(state.stage));
    if (occupied.length === 0) {
      return false;
    }
    const target = randomFrom(occupied);
    const nextColors = CONFIG.colors.filter((color) => color !== target.bubble.color);
    target.bubble.color = randomFrom(nextColors);
    const center = getCellCenter(target.row, target.col);
    addParticles(center.x, center.y, target.bubble.color, 10);
    addPopup(BOSS_ACTION_TEXT.recolor, center.x, center.y - 18, "#ffd166");
    triggerBossPersonaEffect("recolor");
    updateStatus(`${state.boss.name}: ${getBossActionLine("recolor")}`);
    return true;
  }

  function bossAddBubble() {
    const candidates = getAttachableEmptyCells(7 + getSpeedTier(state.stage));
    if (candidates.length === 0) {
      return false;
    }
    const cell = randomFrom(candidates);
    const color = randomFrom(CONFIG.colors);
    setBubble(cell.row, cell.col, createBubble(color));
    const center = getCellCenter(cell.row, cell.col);
    addParticles(center.x, center.y, color, 10);
    addPopup(BOSS_ACTION_TEXT.add, center.x, center.y - 16, "#ff8fab");
    triggerBossPersonaEffect("add");
    updateStatus(`${state.boss.name}: ${getBossActionLine("add")}`);
    checkDangerState();
    return true;
  }

  function bossShuffleBubbles() {
    const occupied = getOccupiedCells(8 + getSpeedTier(state.stage));
    if (occupied.length < 2) {
      return false;
    }
    const first = randomFrom(occupied);
    let alternatives = occupied.filter((cell) => cell.row !== first.row || cell.col !== first.col);
    const differentColor = alternatives.filter((cell) => cell.bubble.color !== first.bubble.color);
    if (differentColor.length > 0) {
      alternatives = differentColor;
    }
    const second = randomFrom(alternatives);
    const firstBubble = getBubble(first.row, first.col);
    const secondBubble = getBubble(second.row, second.col);
    setBubble(first.row, first.col, secondBubble);
    setBubble(second.row, second.col, firstBubble);
    const firstCenter = getCellCenter(first.row, first.col);
    const secondCenter = getCellCenter(second.row, second.col);
    addParticles(firstCenter.x, firstCenter.y, secondBubble.color, 8);
    addParticles(secondCenter.x, secondCenter.y, firstBubble.color, 8);
    addPopup(BOSS_ACTION_TEXT.shuffle, (firstCenter.x + secondCenter.x) / 2, (firstCenter.y + secondCenter.y) / 2 - 18, "#7cf5d6");
    triggerBossPersonaEffect("shuffle");
    updateStatus(`${state.boss.name}: ${getBossActionLine("shuffle")}`);
    return true;
  }

  function triggerBossAction() {
    if (!state.boss) {
      return;
    }
    const actionPool = [bossRecolorBubble, bossAddBubble, bossShuffleBubbles];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const action = actionPool.splice(Math.floor(Math.random() * actionPool.length), 1)[0];
      if (action()) {
        state.flashLevel = Math.max(state.flashLevel, 0.22);
        return;
      }
    }
  }

  function updateBossStage(dt) {
    if (!state.boss) {
      return;
    }
    const boss = state.boss;
    const visuals = getBossVisualConfig(boss);
    const halfWidth = visuals.halfWidth || 24 * visuals.scale;
    const leftBound = CONFIG.fieldLeft + 10 + halfWidth;
    const rightBound = CONFIG.fieldRight - 10 - halfWidth;
    const speedScale = boss.kind === "ghostface" ? 1.06 : boss.kind === "creeper" ? 0.96 : 1;
    boss.floatTime += dt * (1.8 + boss.level * 0.22);
    boss.x += boss.direction * boss.speed * speedScale * dt;
    if (boss.x <= leftBound) {
      boss.x = leftBound;
      boss.direction = 1;
    } else if (boss.x >= rightBound) {
      boss.x = rightBound;
      boss.direction = -1;
    }

    boss.pulse = Math.max(0, boss.pulse - dt * 1.45);
    boss.effectTimer = Math.max(0, boss.effectTimer - dt);

    if (boss.expressions && boss.expressions.length > 0) {
      boss.expressionElapsed += dt;
      if (boss.expressionElapsed >= boss.nextExpressionDelay) {
        boss.expression = pickBossExpression(boss);
        boss.expressionElapsed = 0;
        boss.nextExpressionDelay = getBossExpressionDelay(boss);
      }
    }

    boss.actionElapsed += dt;
    if (boss.actionElapsed >= boss.nextActionDelay) {
      boss.actionElapsed = 0;
      boss.nextActionDelay = getBossActionDelay(boss.level);
      triggerBossAction();
    }
  }
  function launchFinalEndingCelebration() {
    const burstPoints = [
      { x: 92, y: 146, color: "#ffd166", amount: 28 },
      { x: 210, y: 182, color: "#7cf5d6", amount: 32 },
      { x: 328, y: 146, color: "#ff8fab", amount: 28 },
      { x: 130, y: 286, color: "#5f7bff", amount: 24 },
      { x: 290, y: 286, color: "#c77dff", amount: 24 },
    ];

    for (const burst of burstPoints) {
      addParticles(burst.x, burst.y, burst.color, burst.amount);
    }

    addPopup("버블 마스터!", CONFIG.launcherX, 210, "#ffd166");
    addPopup("\uBC84\uBE14 \uC288\uD130 \uACE0\uC218 \uC778\uC815!", CONFIG.launcherX, 254, "#7cf5d6");
  }

  function beginAim(pointerX, pointerY) {
    if (state.mode !== "playing" || state.projectile) {
      return;
    }
    state.aiming = true;
    updateAim(pointerX, pointerY);
  }

  function updateAim(pointerX, pointerY) {
    if (!state.aiming) {
      return;
    }
    const dx = pointerX - CONFIG.launcherX;
    const dy = pointerY - CONFIG.launcherY;
    const rawAngle = Math.atan2(dy, dx);
    state.aimAngle = clamp(rawAngle, -Math.PI + 0.22, -0.22);
  }

  function fireBubble() {
    if (!state.aiming || state.mode !== "playing" || state.projectile) {
      state.aiming = false;
      return;
    }
    state.projectile = {
      x: CONFIG.launcherX,
      y: CONFIG.launcherY,
      vx: Math.cos(state.aimAngle) * CONFIG.projectileSpeed,
      vy: Math.sin(state.aimAngle) * CONFIG.projectileSpeed,
      color: state.currentBubble.color,
    };
    playShotSound();
    state.currentBubble = state.nextBubble;
    state.nextBubble = createBubble(pickBubbleColor());
    state.aiming = false;
    updateLauncherPreview();
    updateStatus("버블 발사 완료! 다음 각도를 읽어봐요.");
  }

  function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function findCollisionAt(x, y) {
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        const bubble = getBubble(row, col);
        if (!bubble) {
          continue;
        }
        const center = getCellCenter(row, col);
        const dx = center.x - x;
        const dy = center.y - y;
        if (dx * dx + dy * dy <= (BUBBLE_DIAMETER - 4) * (BUBBLE_DIAMETER - 4)) {
          return { row, col, center };
        }
      }
    }
    return null;
  }

  function findSnapCell(targetX, targetY) {
    const approximateRow = Math.round((targetY - CONFIG.topPadding - state.boardOffsetY) / CONFIG.rowStep);
    let best = null;

    for (let row = Math.max(0, approximateRow - 3); row <= approximateRow + 3; row += 1) {
      ensureRowExists(row);
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col)) {
          continue;
        }
        const center = getCellCenter(row, col);
        const distance = Math.hypot(center.x - targetX, center.y - targetY);
        const valid = row === 0 || getNeighbors(row, col).some(([nRow, nCol]) => Boolean(getBubble(nRow, nCol)));
        if (!valid || distance > BUBBLE_DIAMETER * 1.35) {
          continue;
        }
        if (!best || distance < best.distance) {
          best = { row, col, distance };
        }
      }
    }

    if (best) {
      return best;
    }

    for (let row = 0; row < state.board.length + 2; row += 1) {
      ensureRowExists(row);
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col)) {
          continue;
        }
        const center = getCellCenter(row, col);
        const distance = Math.hypot(center.x - targetX, center.y - targetY);
        const valid = row === 0 || getNeighbors(row, col).some(([nRow, nCol]) => Boolean(getBubble(nRow, nCol)));
        if (!valid) {
          continue;
        }
        if (!best || distance < best.distance) {
          best = { row, col, distance };
        }
      }
    }

    return best || { row: 0, col: clamp(Math.round((targetX - GRID_START_X) / BUBBLE_DIAMETER), 0, CONFIG.columns - 1) };
  }

  function collectConnectedSameColor(startRow, startCol) {
    const origin = getBubble(startRow, startCol);
    if (!origin) {
      return [];
    }
    const targetColor = origin.color;
    const visited = new Set();
    const stack = [[startRow, startCol]];

    while (stack.length > 0) {
      const [row, col] = stack.pop();
      const key = `${row}:${col}`;
      if (visited.has(key)) {
        continue;
      }
      const bubble = getBubble(row, col);
      if (!bubble || bubble.color !== targetColor) {
        continue;
      }
      visited.add(key);
      for (const neighbor of getNeighbors(row, col)) {
        stack.push(neighbor);
      }
    }

    return Array.from(visited).map((key) => {
      const [row, col] = key.split(":").map(Number);
      return { row, col };
    });
  }

  function collectFloatingBubbles() {
    const connected = new Set();
    const stack = [];
    for (let col = 0; col < CONFIG.columns; col += 1) {
      if (getBubble(0, col)) {
        stack.push([0, col]);
      }
    }

    while (stack.length > 0) {
      const [row, col] = stack.pop();
      const key = `${row}:${col}`;
      if (connected.has(key) || !getBubble(row, col)) {
        continue;
      }
      connected.add(key);
      for (const neighbor of getNeighbors(row, col)) {
        stack.push(neighbor);
      }
    }

    const floating = [];
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col) && !connected.has(`${row}:${col}`)) {
          floating.push({ row, col });
        }
      }
    }
    return floating;
  }

  function removeBubbles(bubbles, popLabel) {
    if (bubbles.length === 0) {
      return;
    }
    let averageX = 0;
    let averageY = 0;
    let count = 0;

    for (const { row, col } of bubbles) {
      const bubble = getBubble(row, col);
      if (!bubble) {
        continue;
      }
      const center = getCellCenter(row, col);
      averageX += center.x;
      averageY += center.y;
      count += 1;
      addParticles(center.x, center.y, bubble.color, 8);
      setBubble(row, col, null);
    }

    if (count > 0) {
      addPopup(popLabel, averageX / count, averageY / count, "#ffe29a");
    }
  }

  function getRemainingBubbleCount() {
    let count = 0;
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (getBubble(row, col)) {
          count += 1;
        }
      }
    }
    return count;
  }

  function queueStageClear() {
    if (state.stageClearQueued) {
      return;
    }
    state.stageClearQueued = true;
    if (state.stageClearTimerId) {
      window.clearTimeout(state.stageClearTimerId);
    }
    const queuedStage = state.stage;
    state.stageClearTimerId = window.setTimeout(() => {
      state.stageClearTimerId = 0;
      if (state.mode !== "playing" || state.stage !== queuedStage || !state.stageClearQueued) {
        return;
      }
      state.mode = "clear";
      playStageClearSound();
      const bossScript = state.boss ? getBossScript(state.boss) : null;

      if (isFinalStage(state.stage)) {
        if (state.boss) {
          playBossDefeatSound(state.boss);
        }
        launchFinalEndingCelebration();
        showOverlay({
          kicker: "Final Ending",
          title: "20스테이지 정복 완료!",
          message: `${bossScript ? bossScript.clear + " " : ""}${BOSS_NAMES[BOSS_NAMES.length - 1]}까지 물리치며 20개 스테이지를 모두 끝냈어요. 최종 점수는 ${state.score.toLocaleString("ko-KR")}점. 이제 Bubble Pop 세계의 정식 버블 슈터 마스터예요.`,
          primaryLabel: "처음부터 다시",
          primaryAction: "newGame",
          secondaryLabel: "20스테이지 다시",
          secondaryAction: "restart",
        });
        updateStatus("마지막 보스까지 클리어했어요! 엔딩이 열렸습니다.");
      } else if (isBossStage(state.stage)) {
        const nextInterval = getStageDescendInterval(state.stage + 1);
        if (state.boss) {
          playBossDefeatSound(state.boss);
        }
        showOverlay({
          kicker: "Boss Down",
          title: `${state.boss ? state.boss.name : BOSS_NAMES[getBossLevel(state.stage) - 1]} 격파`,
          message: `${bossScript ? bossScript.clear + " " : ""}보스 스테이지를 넘겼어요. 다음 4개 스테이지부터는 버블 벽이 더 빠른 ${Math.round(nextInterval / 100) / 10}초 페이스로 내려옵니다. 이제 리듬도 더 빠르게 잡아야 해요.`,
          primaryLabel: "다음 스테이지",
          primaryAction: "nextStage",
          secondaryLabel: "다시하기",
          secondaryAction: "restart",
        });
        updateStatus(`${state.boss ? state.boss.name : "보스"}: ${bossScript ? bossScript.clear : "다음 구간부터 하강 속도가 더 빠르게 올라갑니다."}`);
      } else {
        const nextMessage = (state.stage + 1) % 5 === 0
          ? `다음은 보스 스테이지예요. ${BOSS_NAMES[getBossLevel(state.stage + 1) - 1]}가 기다리고 있어요.`
          : `\uD604\uC7AC \uD558\uAC15 \uC18D\uB3C4\uB294 ${Math.round(state.descendIntervalMs / 100) / 10}\uCD08 \uD398\uC774\uC2A4\uB97C \uC720\uC9C0\uD574\uC694.`;
        showOverlay({
          kicker: "Stage Clear",
          title: `Stage ${getStageNumberLabel(state.stage)} \uD074\uB9AC\uC5B4`,
          message: `이번 스테이지를 ${state.score.toLocaleString("ko-KR")}점으로 끝냈어요. ${nextMessage}`,
          primaryLabel: "\uB2E4\uC74C \uC2A4\uD14C\uC774\uC9C0",
          primaryAction: "nextStage",
          secondaryLabel: "\uB2E4\uC2DC\uD558\uAE30",
          secondaryAction: "restart",
        });
        updateStatus(`Stage ${getStageNumberLabel(state.stage)} 클리어! ${getUpcomingHint(state.stage)}`);
      }
      updateHud();
    }, 320);
  }

  function triggerGameOver() {
    if (state.mode === "gameover") {
      return;
    }
    state.stageClearQueued = false;
    if (state.stageClearTimerId) {
      window.clearTimeout(state.stageClearTimerId);
      state.stageClearTimerId = 0;
    }
    state.mode = "gameover";
    state.projectile = null;
    state.aiming = false;
    triggerShake();
    playGameOverSound();
    showOverlay({
      kicker: "Retry",
      title: "한 판 더 도전해볼까요?",
      message: `\uCD5C\uC885 \uC810\uC218 ${state.score.toLocaleString("ko-KR")}\uC810, \uB3C4\uB2EC \uC2A4\uD14C\uC774\uC9C0 ${state.stage}. \uB2E4\uC74C \uD310\uC5D0\uC11C\uB294 \uB354 \uBA4B\uC9C4 \uAC01\uB3C4\uAC00 \uB098\uC62C \uAC70\uC608\uC694.`,
      primaryLabel: "\uB2E4\uC2DC\uD558\uAE30",
      primaryAction: "restart",
      secondaryLabel: "\uCC98\uC74C\uBD80\uD130",
      secondaryAction: "newGame",
    });
    updateStatus("이번 라운드는 여기까지예요. 다시 시작해볼까요?");
    updateHud();
  }

  function getLowestBubbleBottom() {
    let lowest = -Infinity;
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        if (!getBubble(row, col)) {
          continue;
        }
        const center = getCellCenter(row, col);
        lowest = Math.max(lowest, center.y + CONFIG.bubbleRadius);
      }
    }
    return lowest;
  }

  function checkDangerState() {
    const lowest = getLowestBubbleBottom();
    const nearDanger = lowest >= CONFIG.dangerLineY - 48;
    boardStage.classList.toggle("warning", nearDanger);
    if (lowest >= CONFIG.dangerLineY) {
      triggerGameOver();
    }
  }

  function descendBoard(amount, fromPenalty = false) {
    state.boardOffsetY += amount;
    state.descendElapsed = 0;
    state.flashLevel = fromPenalty ? 0.85 : 0.45;
    triggerShake();
    playDescendSound(fromPenalty);
    checkDangerState();
  }

  function resolveShot(cell) {
    setBubble(cell.row, cell.col, createBubble(state.projectile.color));
    state.projectile = null;

    const matched = collectConnectedSameColor(cell.row, cell.col);
    if (matched.length >= 3) {
      const matchedCount = matched.length;
      removeBubbles(matched, `${matchedCount}\uAC1C \uBC84\uBE14 \uD321`);
      const floating = collectFloatingBubbles();
      const floatingCount = floating.length;
      if (floatingCount > 0) {
        removeBubbles(floating, `${floatingCount}\uAC1C \uBC84\uBE14 \uB099\uD558`);
      }

      state.combo += 1;
      state.missStreak = 0;
      playMatchSound(matchedCount, state.combo);
      if (floatingCount > 0) {
        playDropSound(floatingCount);
      }
      const comboBonus = state.combo > 1 ? (state.combo - 1) * 25 : 0;
      const gainedScore = matchedCount * 120 + floatingCount * 180 + comboBonus;
      state.score += gainedScore;
      addPopup(`+${gainedScore}`, CONFIG.launcherX, CONFIG.launcherY - 86, "#7cf5d6");
      updateStatus(
        floatingCount > 0
          ? `${matchedCount}개 매치에 ${floatingCount}개 낙하! 콤보 ${state.combo}!`
          : `${matchedCount}개 버블을 제거했어요. 콤보 ${state.combo}!`
      );
      if (state.combo > 1) {
        addPopup(getComboCheer(state.combo), CONFIG.launcherX, CONFIG.launcherY - 120, "#ffd166");
      }
    } else {
      state.combo = 0;
      state.missStreak += 1;
      updateStatus(`${randomFrom(MISS_LINES)} 매치 실패 ${state.missStreak}/${CONFIG.missLimit}.`);
      if (state.missStreak >= CONFIG.missLimit) {
        state.missStreak = 0;
        descendBoard(CONFIG.descendPenaltyStep, true);
        addPopup("Pressure Drop", CONFIG.launcherX, CONFIG.dangerLineY - 32, "#ff8f8f");
        updateStatus("5번 연속 실패로 벽이 더 내려왔어요. 다시 리듬을 잡아봐요.");
      }
    }

    if (getRemainingBubbleCount() === 0) {
      queueStageClear();
    }

    checkDangerState();
    updateHud();
    updateLauncherPreview();
  }

  function stepProjectile(dt) {
    if (!state.projectile) {
      return;
    }
    const stepCount = Math.max(1, Math.ceil((CONFIG.projectileSpeed * dt) / 10));
    const subStep = dt / stepCount;

    for (let step = 0; step < stepCount; step += 1) {
      state.projectile.x += state.projectile.vx * subStep;
      state.projectile.y += state.projectile.vy * subStep;

      if (state.projectile.x <= CONFIG.fieldLeft + CONFIG.bubbleRadius && state.projectile.vx < 0) {
        state.projectile.x = CONFIG.fieldLeft + CONFIG.bubbleRadius;
        state.projectile.vx *= -1;
      } else if (state.projectile.x >= CONFIG.fieldRight - CONFIG.bubbleRadius && state.projectile.vx > 0) {
        state.projectile.x = CONFIG.fieldRight - CONFIG.bubbleRadius;
        state.projectile.vx *= -1;
      }

      const topLimit = CONFIG.topPadding + state.boardOffsetY;
      if (state.projectile.y <= topLimit) {
        const snapCell = findSnapCell(state.projectile.x, topLimit);
        resolveShot(snapCell);
        return;
      }

      if (findCollisionAt(state.projectile.x, state.projectile.y)) {
        const snapCell = findSnapCell(state.projectile.x, state.projectile.y);
        resolveShot(snapCell);
        return;
      }
    }
  }

  function updateParticles(dt) {
    state.particles = state.particles.filter((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.985;
      particle.vy = particle.vy * 0.985 + 420 * dt;
      return particle.life > 0;
    });

    state.popups = state.popups.filter((popup) => {
      popup.life -= dt * 1.2;
      popup.y -= 38 * dt;
      return popup.life > 0;
    });

    state.flashLevel = Math.max(0, state.flashLevel - dt * 1.8);
  }

  function stepGame(dt) {
    if (state.mode !== "playing") {
      updateParticles(dt);
      return;
    }

    if (state.stageClearQueued) {
      updateParticles(dt);
      return;
    }

    state.descendElapsed += dt * 1000;
    if (state.descendElapsed >= state.descendIntervalMs) {
      descendBoard(CONFIG.descendHalfStep);
      updateStatus("버블 벽이 다시 내려왔어요. 페이스를 놓치지 말아봐요.");
    }

    updateBossStage(dt);
    stepProjectile(dt);
    updateParticles(dt);
    checkDangerState();
    updateHud();
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const panelGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    panelGradient.addColorStop(0, "#0f2448");
    panelGradient.addColorStop(0.4, "#13213f");
    panelGradient.addColorStop(1, "#120f24");
    ctx.fillStyle = panelGradient;
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 22);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = 0.16;
    for (let row = 0; row < 11; row += 1) {
      const y = CONFIG.topPadding - 10 + row * 48;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CONFIG.fieldLeft + 8, y);
      ctx.lineTo(CONFIG.fieldRight - 8, y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 3;
    ctx.strokeRect(CONFIG.fieldLeft, 26, CONFIG.fieldRight - CONFIG.fieldLeft, CONFIG.dangerLineY - 24);

    ctx.save();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = "rgba(255, 116, 116, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CONFIG.fieldLeft + 6, CONFIG.dangerLineY);
    ctx.lineTo(CONFIG.fieldRight - 6, CONFIG.dangerLineY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255, 140, 140, 0.9)";
    ctx.font = "700 16px Trebuchet MS";
    ctx.fillText("위험선", CONFIG.fieldRight - 58, CONFIG.dangerLineY - 8);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.arc(CONFIG.launcherX, CONFIG.launcherY + 22, 46, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawStageStamp() {
    ctx.save();
    ctx.fillStyle = "rgba(124, 245, 214, 0.14)";
    roundRect(ctx, CONFIG.fieldLeft + 12, 28, 192, 50, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(124, 245, 214, 0.34)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "rgba(124, 245, 214, 0.94)";
    ctx.font = "700 14px Trebuchet MS";
    ctx.fillText(`STAGE ${getStageNumberLabel(state.stage)}`, CONFIG.fieldLeft + 26, 49);
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.font = "700 11px Trebuchet MS";
    ctx.fillText(getStageTheme(state.stage), CONFIG.fieldLeft + 26, 68);
    ctx.restore();
  }

  function drawSparkle(x, y, size, color, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.restore();
  }

  function getBossVisualConfig(boss) {
    if (!boss) {
      return { scale: 1.42, lift: 56, auraRadius: 50, nameplateWidth: 144, nameplateY: 82, halfWidth: 32 };
    }

    if (boss.kind === "creeper") {
      return { scale: 1.5, lift: 58, auraRadius: 52, nameplateWidth: 142, nameplateY: 82, halfWidth: 34 };
    }
    if (boss.kind === "hannibal") {
      return { scale: 1.76, lift: 74, auraRadius: 62, nameplateWidth: 182, nameplateY: 98, halfWidth: 46 };
    }
    if (boss.kind === "winter") {
      return { scale: 1.78, lift: 74, auraRadius: 64, nameplateWidth: 174, nameplateY: 98, halfWidth: 48 };
    }
    return { scale: 1.58, lift: 62, auraRadius: 58, nameplateWidth: 152, nameplateY: 88, halfWidth: 36 };
  }

  function drawBossAura(x, y, boss, visuals) {
    const radius = visuals.auraRadius + boss.pulse * 12;
    const aura = ctx.createRadialGradient(x, y, 10, x, y, radius);
    aura.addColorStop(0, boss.auraColor || "rgba(255, 132, 132, 0.32)");
    aura.addColorStop(0.62, mixColor(boss.accent || "#ffffff", 0.18).replace("rgb", "rgba").replace(")", ", 0.12)"));
    aura.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 + boss.pulse * 0.1})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, radius - 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawBossNameplate(x, y, boss, visuals) {
    const width = visuals.nameplateWidth;
    const yOffset = visuals.nameplateY;
    ctx.save();
    ctx.fillStyle = "rgba(11, 16, 28, 0.74)";
    roundRect(ctx, x - width / 2, y - yOffset, width, 24, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = mixColor(boss.accent || "#ffffff", 0.25);
    ctx.font = "700 12px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(boss.name, x, y - yOffset + 16);
    ctx.restore();
  }

  function drawCreeperBoss(x, y, boss, scale) {
    ctx.save();
    ctx.translate(x, y + 8);
    ctx.scale(scale, scale);
    const pulse = 1 + boss.pulse * 0.09;
    ctx.scale(pulse, pulse);

    for (let index = 0; index < 4; index += 1) {
      ctx.fillStyle = `rgba(82, 255, 119, ${0.18 - index * 0.035})`;
      ctx.fillRect(-30 - boss.direction * index * 5, -28 + index * 4, 16, 50 - index * 5);
    }

    if (boss.effectTimer > 0) {
      const energy = 1 - boss.effectTimer / 0.95;
      for (let ring = 0; ring < 4; ring += 1) {
        const size = 58 + ring * 10 + energy * 10;
        ctx.strokeStyle = `rgba(123, 255, 111, ${0.34 - ring * 0.06})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
      }
      for (let spark = 0; spark < 9; spark += 1) {
        ctx.fillStyle = spark % 2 === 0 ? "#d8ff8f" : "#62ff89";
        const phase = boss.floatTime * 3.2 + spark * 0.7;
        ctx.fillRect(Math.cos(phase) * 35 - 3, Math.sin(phase * 1.15) * 26 - 3, 6, 6);
      }
    }

    ctx.fillStyle = "#2d6f2f";
    ctx.fillRect(-20, 18, 40, 18);
    ctx.fillStyle = "#245f2d";
    ctx.fillRect(-18, 32, 10, 16);
    ctx.fillRect(8, 32, 10, 16);
    ctx.fillRect(-6, 32, 12, 10);

    const gradient = ctx.createLinearGradient(-28, -30, 28, 28);
    gradient.addColorStop(0, "#a7ff8d");
    gradient.addColorStop(0.5, "#56c95c");
    gradient.addColorStop(1, "#255f30");
    ctx.fillStyle = gradient;
    ctx.fillRect(-28, -30, 56, 56);

    const camo = [
      [-20, -22, 9, 9, "#7fe06d"],
      [-5, -26, 12, 10, "#6bc95f"],
      [12, -18, 8, 8, "#80f07d"],
      [-24, 0, 10, 10, "#347d35"],
      [8, 8, 12, 8, "#356e35"],
      [-2, 14, 9, 9, "#8ef481"],
    ];
    for (const [cx, cy, width, height, color] of camo) {
      ctx.fillStyle = color;
      ctx.fillRect(cx, cy, width, height);
    }

    ctx.fillStyle = boss.secondary || "#234b28";
    ctx.fillRect(-16, -14, 10, 13);
    ctx.fillRect(6, -14, 10, 13);
    ctx.fillRect(-6, 0, 12, 18);
    ctx.fillRect(-16, 11, 10, 7);
    ctx.fillRect(6, 11, 10, 7);

    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    ctx.fillRect(-20, -24, 14, 12);
    ctx.fillRect(6, -26, 8, 8);
    ctx.strokeStyle = "rgba(18, 41, 17, 0.82)";
    ctx.lineWidth = 2.2;
    ctx.strokeRect(-28, -30, 56, 56);
    ctx.restore();
  }

  function drawHannibalBoss(x, y, boss, scale) {
    const expression = boss.expression || "cold";
    const portrait = getBossPortraitImage(boss);
    ctx.save();
    ctx.translate(x, y + 10);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(14, 10, 11, 0.26)";
    ctx.beginPath();
    ctx.ellipse(0, 25, 24, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    const pulseScale = 1 + boss.pulse * 0.04;
    ctx.scale(pulseScale, pulseScale);

    if (portrait && portrait.complete && portrait.naturalWidth > 0) {
      ctx.drawImage(portrait, -39, -41, 78, 78);
    } else {
      const fallback = ctx.createLinearGradient(-26, -40, 26, 44);
      fallback.addColorStop(0, "#d8b4a6");
      fallback.addColorStop(1, "#705149");
      ctx.fillStyle = fallback;
      ctx.beginPath();
      ctx.ellipse(0, -2, 24, 34, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    let browLift = -15;
    let browTilt = 2.4;
    let lidDrop = 0.2;
    let mouthMode = "flat";
    if (expression === "glare") {
      browLift = -17;
      browTilt = 4.8;
      lidDrop = 1.8;
    } else if (expression === "smirk") {
      browLift = -15;
      browTilt = 3.1;
      lidDrop = 0.9;
      mouthMode = "smirk";
    } else if (expression === "amused") {
      browLift = -13;
      browTilt = 1.2;
      lidDrop = -0.3;
      mouthMode = "smile";
    }

    ctx.strokeStyle = "rgba(34, 18, 18, 0.78)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-16, browLift + browTilt);
    ctx.lineTo(-4, browLift - browTilt);
    ctx.moveTo(4, browLift - browTilt);
    ctx.lineTo(16, browLift + browTilt);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, -15);
    ctx.quadraticCurveTo(-6, -17 + lidDrop, -1, -14.5);
    ctx.moveTo(1, -14.5);
    ctx.quadraticCurveTo(6, -17 + lidDrop, 10, -15);
    ctx.stroke();

    ctx.strokeStyle = "rgba(16, 18, 24, 0.86)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(-10, -8.5, 6.8, 2.4 + lidDrop * 0.16, 0, Math.PI * 0.1, Math.PI * 0.92);
    ctx.ellipse(10, -8.5, 6.8, 2.4 + lidDrop * 0.16, 0, Math.PI * 0.08, Math.PI * 0.9);
    ctx.stroke();

    ctx.strokeStyle = "rgba(97, 53, 43, 0.55)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(-1.1, 8);
    ctx.moveTo(-4, 9.8);
    ctx.quadraticCurveTo(0, 12.2, 4, 9.8);
    ctx.stroke();

    ctx.strokeStyle = mouthMode === "smile" ? "rgba(122, 68, 58, 0.9)" : "rgba(96, 54, 46, 0.84)";
    ctx.lineWidth = 1.45;
    ctx.beginPath();
    if (mouthMode === "smile") {
      ctx.moveTo(-5.6, 16.2);
      ctx.quadraticCurveTo(0, 19.4, 5.8, 16.6);
    } else if (mouthMode === "smirk") {
      ctx.moveTo(-5.8, 16.8);
      ctx.quadraticCurveTo(-1.2, 17.8, 2.5, 17.2);
      ctx.quadraticCurveTo(6.6, 15.9, 8.2, 13.8);
    } else {
      ctx.moveTo(-5.2, 16.9);
      ctx.quadraticCurveTo(0, 16.2, 5.4, 16.8);
    }
    ctx.stroke();

    if (boss.effectTimer > 0) {
      const sweep = 1 - boss.effectTimer / 0.95;
      ctx.strokeStyle = `rgba(182, 226, 255, ${0.46 - sweep * 0.22})`;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(-24 + sweep * 28, -18);
      ctx.lineTo(-8 + sweep * 28, 6);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }

  function drawWinterBoss(x, y, boss, scale) {
    const expression = boss.expression || "smile";
    const portrait = getBossPortraitImage(boss);
    ctx.save();
    ctx.translate(x, y + 10);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(248, 190, 204, 0.16)";
    ctx.beginPath();
    ctx.ellipse(0, 26, 26, 7.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    const pulseScale = 1 + boss.pulse * 0.04;
    ctx.scale(pulseScale, pulseScale);

    if (portrait && portrait.complete && portrait.naturalWidth > 0) {
      ctx.drawImage(portrait, -41, -43, 82, 82);
    } else {
      const fallback = ctx.createLinearGradient(-24, -40, 24, 44);
      fallback.addColorStop(0, "#ffe8ea");
      fallback.addColorStop(1, "#d09b95");
      ctx.fillStyle = fallback;
      ctx.beginPath();
      ctx.ellipse(0, -1, 24, 34, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let orb = 0; orb < 2; orb += 1) {
      const orbX = -27 + orb * 54 + Math.sin(boss.floatTime + orb) * 1.8;
      const orbY = -28 + orb * 8;
      ctx.fillStyle = `rgba(255, 235, 255, ${0.08 + orb * 0.05})`;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 8 + orb * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawEye(centerX, open = 1, wink = false) {
      if (wink) {
        ctx.strokeStyle = "rgba(87, 52, 48, 0.88)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(centerX - 5.5, -2.8);
        ctx.quadraticCurveTo(centerX, -5.2, centerX + 5.5, -2.6);
        ctx.stroke();
        return;
      }
      ctx.strokeStyle = "rgba(70, 42, 39, 0.92)";
      ctx.lineWidth = 1.45;
      ctx.beginPath();
      ctx.moveTo(centerX - 6, -6.5);
      ctx.quadraticCurveTo(centerX, -8.8, centerX + 6, -6.2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.34)";
      ctx.beginPath();
      ctx.moveTo(centerX - 5.1, -5.5);
      ctx.quadraticCurveTo(centerX, -7 + open * 0.4, centerX + 5.1, -5.4);
      ctx.stroke();
    }

    let mouthMode = "smile";
    if (expression === "wink") {
      drawEye(-10, 1, true);
      drawEye(10, 1.02, false);
    } else if (expression === "focus") {
      drawEye(-10, 0.74, false);
      drawEye(10, 0.74, false);
      mouthMode = "flat";
    } else if (expression === "surprised") {
      drawEye(-10, 1.1, false);
      drawEye(10, 1.1, false);
      mouthMode = "open";
    } else {
      drawEye(-10, 1, false);
      drawEye(10, 1, false);
    }

    ctx.strokeStyle = "rgba(113, 71, 64, 0.42)";
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(0, 0.5);
    ctx.lineTo(-1, 9.2);
    ctx.moveTo(-3.2, 10.8);
    ctx.quadraticCurveTo(0, 12.6, 3.2, 10.8);
    ctx.stroke();

    ctx.strokeStyle = "rgba(242, 156, 179, 0.94)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    if (mouthMode === "open") {
      ctx.ellipse(0, 17.4, 3.2, 4, 0, 0, Math.PI * 2);
    } else if (mouthMode === "flat") {
      ctx.moveTo(-5.2, 16.6);
      ctx.lineTo(5.2, 16.6);
    } else {
      ctx.moveTo(-5.6, 16.1);
      ctx.quadraticCurveTo(0, 19, 5.6, 16.1);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 247, 250, 0.62)";
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(-1.8, 16.6);
    ctx.lineTo(2.8, 17.1);
    ctx.stroke();

    if (boss.effectTimer > 0) {
      const alpha = 0.28 + boss.effectTimer * 0.16;
      drawSparkle(-30, -18, 5.4, `rgba(255, 231, 238, ${alpha})`, boss.floatTime * 0.6);
      drawSparkle(30, -7, 4.8, `rgba(255, 231, 238, ${alpha})`, -boss.floatTime * 0.74);
      drawSparkle(0, -34, 4.9, `rgba(255, 171, 215, ${alpha * 0.88})`, boss.floatTime * 0.4);
    }

    ctx.restore();
    ctx.restore();
  }

  function drawGhostfaceBoss(x, y, boss, scale) {
    ctx.save();
    ctx.translate(x, y + 8);
    ctx.scale(scale, scale);

    for (let trail = 0; trail < 4; trail += 1) {
      const alpha = 0.17 - trail * 0.035;
      ctx.fillStyle = `rgba(34, 39, 63, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(-24 - boss.direction * trail * 5, -12 + trail * 3);
      ctx.quadraticCurveTo(-40, 20, -16, 36 - trail * 3);
      ctx.lineTo(16, 36 - trail * 3);
      ctx.quadraticCurveTo(40, 20, 24 - boss.direction * trail * 5, -12 + trail * 3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#0f1324";
    ctx.beginPath();
    ctx.moveTo(-28, -10);
    ctx.quadraticCurveTo(-24, -36, 0, -40);
    ctx.quadraticCurveTo(24, -36, 28, -10);
    ctx.quadraticCurveTo(34, 24, 0, 40);
    ctx.quadraticCurveTo(-34, 24, -28, -10);
    ctx.closePath();
    ctx.fill();

    const mask = ctx.createLinearGradient(0, -26, 0, 24);
    mask.addColorStop(0, "#ffffff");
    mask.addColorStop(0.6, "#eff1ff");
    mask.addColorStop(1, "#c8cce6");
    ctx.fillStyle = mask;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111420";
    ctx.beginPath();
    ctx.ellipse(-6, -9, 4.4, 6.8, 0.22, 0, Math.PI * 2);
    ctx.ellipse(6, -9, 4.4, 6.8, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 11, 4.6, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(220, 224, 255, 0.36)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-15, -2);
    ctx.quadraticCurveTo(0, 4, 15, -2);
    ctx.stroke();

    if (boss.effectTimer > 0) {
      const pulse = 1 - boss.effectTimer / 1.15;
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.strokeStyle = `rgba(214, 219, 255, ${0.32 - ring * 0.07})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 12, 9 + ring * 8 + pulse * 12, 6 + ring * 3 + pulse * 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let wisp = 0; wisp < 5; wisp += 1) {
        const phase = boss.floatTime * 1.7 + wisp * 0.9;
        ctx.strokeStyle = `rgba(160, 170, 255, ${0.22 - wisp * 0.025})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(phase) * 18, -6 + wisp * 3);
        ctx.quadraticCurveTo(Math.sin(phase) * 34, 9 + wisp * 4, Math.cos(phase * 1.1) * 22, 28 + wisp * 3);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawBoss() {
    if (!state.boss) {
      return;
    }
    const bossPosition = getBossDrawPosition();
    if (!bossPosition) {
      return;
    }

    const { x, y } = bossPosition;
    const boss = state.boss;
    const visuals = getBossVisualConfig(boss);
    ctx.save();
    ctx.globalAlpha = 0.98;
    drawBossAura(x, y, boss, visuals);

    if (boss.kind === "creeper") {
      drawCreeperBoss(x, y, boss, visuals.scale);
    } else if (boss.kind === "hannibal") {
      drawHannibalBoss(x, y, boss, visuals.scale);
    } else if (boss.kind === "winter") {
      drawWinterBoss(x, y, boss, visuals.scale);
    } else {
      drawGhostfaceBoss(x, y, boss, visuals.scale);
    }

    drawBossNameplate(x, y, boss, visuals);
    ctx.restore();
  }

  function drawBubble(x, y, color, radius = CONFIG.bubbleRadius, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const gradient = ctx.createRadialGradient(
      x - radius * 0.4,
      y - radius * 0.45,
      radius * 0.2,
      x,
      y,
      radius
    );
    gradient.addColorStop(0, mixColor(color, 0.64));
    gradient.addColorStop(0.52, color);
    gradient.addColorStop(1, mixColor(color, -0.38));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
    ctx.beginPath();
    ctx.arc(x - radius * 0.28, y - radius * 0.34, radius * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBoardBubbles() {
    for (let row = 0; row < state.board.length; row += 1) {
      for (let col = 0; col < CONFIG.columns; col += 1) {
        const bubble = getBubble(row, col);
        if (!bubble) {
          continue;
        }
        const center = getCellCenter(row, col);
        drawBubble(center.x, center.y, bubble.color);
      }
    }
  }

  function drawAimGuide() {
    if (!state.aiming || state.projectile || state.mode !== "playing") {
      return;
    }

    let x = CONFIG.launcherX;
    let y = CONFIG.launcherY;
    let vx = Math.cos(state.aimAngle);
    let vy = Math.sin(state.aimAngle);

    ctx.save();
    for (let index = 0; index < 24; index += 1) {
      x += vx * 18;
      y += vy * 18;

      if (x <= CONFIG.fieldLeft + CONFIG.bubbleRadius) {
        x = CONFIG.fieldLeft + CONFIG.bubbleRadius + (CONFIG.fieldLeft + CONFIG.bubbleRadius - x);
        vx *= -1;
      } else if (x >= CONFIG.fieldRight - CONFIG.bubbleRadius) {
        x = CONFIG.fieldRight - CONFIG.bubbleRadius - (x - (CONFIG.fieldRight - CONFIG.bubbleRadius));
        vx *= -1;
      }

      if (y <= CONFIG.topPadding + state.boardOffsetY - 8) {
        break;
      }

      ctx.globalAlpha = 0.18 + index * 0.02;
      ctx.fillStyle = "#f8fbff";
      ctx.beginPath();
      ctx.arc(x, y, 4 - index * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawLauncher() {
    ctx.save();
    ctx.translate(CONFIG.launcherX, CONFIG.launcherY + 20);
    ctx.rotate(state.mode === "playing" ? state.aimAngle + Math.PI / 2 : 0);
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    roundRect(ctx, -15, -48, 30, 64, 14);
    ctx.fill();
    ctx.restore();

    if (!state.projectile && state.currentBubble) {
      drawBubble(CONFIG.launcherX, CONFIG.launcherY, state.currentBubble.color);
    }

    if (state.projectile) {
      drawBubble(state.projectile.x, state.projectile.y, state.projectile.color);
    }

    if (state.nextBubble) {
      drawBubble(CONFIG.fieldRight - 40, CONFIG.launcherY + 6, state.nextBubble.color, 18, 0.9);
      ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
      ctx.font = "700 14px Trebuchet MS";
      ctx.fillText("NEXT", CONFIG.fieldRight - 61, CONFIG.launcherY - 25);
    }
  }

  function drawParticles() {
    for (const particle of state.particles) {
      ctx.save();
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const popup of state.popups) {
      ctx.save();
      ctx.globalAlpha = clamp(popup.life, 0, 1);
      ctx.fillStyle = popup.color;
      ctx.font = "700 26px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText(popup.text, popup.x, popup.y);
      ctx.restore();
    }
  }

  function drawWarningOverlay() {
    const lowest = getLowestBubbleBottom();
    if (lowest < CONFIG.dangerLineY - 56 && state.flashLevel <= 0) {
      return;
    }
    const intensity = clamp(
      Math.max((lowest - (CONFIG.dangerLineY - 70)) / 90, 0) * 0.28 + state.flashLevel * 0.2,
      0,
      0.4
    );
    ctx.save();
    const overlay = ctx.createLinearGradient(0, CONFIG.dangerLineY - 120, 0, canvas.height);
    overlay.addColorStop(0, `rgba(255, 90, 90, ${intensity * 0.15})`);
    overlay.addColorStop(1, `rgba(255, 90, 90, ${intensity})`);
    ctx.fillStyle = overlay;
    ctx.fillRect(CONFIG.fieldLeft, CONFIG.dangerLineY - 110, CONFIG.fieldRight - CONFIG.fieldLeft, canvas.height);
    ctx.restore();
  }

  function drawMissCounter() {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "700 16px Trebuchet MS";
    ctx.fillText(`연속 실수 ${state.missStreak}/${CONFIG.missLimit}`, CONFIG.fieldLeft + 18, CONFIG.launcherY - 30);
    ctx.restore();
  }

  function render() {
    drawBackground();
    drawStageStamp();
    drawAimGuide();
    drawBoardBubbles();
    drawBoss();
    drawLauncher();
    drawParticles();
    drawWarningOverlay();
    drawMissCounter();
  }

  function gameLoop(timestamp) {
    if (!state.lastTime) {
      state.lastTime = timestamp;
    }
    const dt = clamp((timestamp - state.lastTime) / 1000, 0, 0.032);
    state.lastTime = timestamp;

    stepGame(dt);
    render();

    state.animationFrameId = window.requestAnimationFrame(gameLoop);
  }

  function handlePrimaryAction() {
    switch (state.overlayPrimaryAction) {
      case "resume":
        hideOverlay(stateScreen);
        state.mode = "playing";
        updateStatus("다시 버블쇼 시작!");
        break;
      case "bossIntro": {
        hideOverlay(stateScreen);
        state.mode = "playing";
        if (state.boss) {
          const script = getBossScript(state.boss);
          updateStatus(script.entryStatus);
          addPopup(state.boss.name, CONFIG.launcherX, 156, state.boss.accent || "#ffd166");
          state.flashLevel = Math.max(state.flashLevel, 0.18);
        }
        break;
      }
      case "restart":
        resetRun(state.stage);
        break;
      case "nextStage":
        if (isFinalStage(state.stage)) {
          resetRun(1);
          break;
        }
        state.score += state.stage * 300;
        resetRun(state.stage + 1, true);
        break;
      case "newGame":
        resetRun(1);
        break;
      default:
        break;
    }
    updateHud();
  }

  function handleSecondaryAction() {
    switch (state.overlaySecondaryAction) {
      case "restart":
        resetRun(state.stage);
        break;
      case "newGame":
        resetRun(1);
        break;
      default:
        break;
    }
    updateHud();
  }

  function goHome() {
    state.mode = "title";
    state.stage = 1;
    state.score = 0;
    state.projectile = null;
    state.aiming = false;
    state.combo = 0;
    state.missStreak = 0;
    state.descendElapsed = 0;
    state.descendIntervalMs = CONFIG.descendIntervalMs;
    state.boardOffsetY = 0;
    if (state.stageClearTimerId) {
      window.clearTimeout(state.stageClearTimerId);
      state.stageClearTimerId = 0;
    }
    state.stageClearQueued = false;
    state.flashLevel = 0;
    state.board = createEmptyBoard();
    state.currentBubble = null;
    state.nextBubble = null;
    state.particles = [];
    state.popups = [];
    state.boss = null;
    boardStage.classList.remove("warning", "shake");
    showElement(titleScreen);
    hideOverlay(stateScreen);
    updateStatus("시작 버튼을 누르면 20개 스테이지 챌린지가 열려요.");
    updateHud();
    updateLauncherPreview();
  }

  pauseButton.addEventListener("click", togglePause);
  startGameButton.addEventListener("click", () => {
    unlockAudio();
    resetRun(1);
  });
  primaryActionButton.addEventListener("click", handlePrimaryAction);
  secondaryActionButton.addEventListener("click", handleSecondaryAction);
  homeActionButton.addEventListener("click", goHome);

  canvas.addEventListener("pointerdown", (event) => {
    unlockAudio();
    const point = getCanvasCoordinates(event);
    beginAim(point.x, point.y);
  });

  canvas.addEventListener("pointermove", (event) => {
    const point = getCanvasCoordinates(event);
    updateAim(point.x, point.y);
  });

  canvas.addEventListener("pointerup", fireBubble);
  canvas.addEventListener("pointerleave", () => {
    if (state.aiming) {
      fireBubble();
    }
  });
  canvas.addEventListener("pointercancel", () => {
    state.aiming = false;
  });

  window.addEventListener("resize", requestResponsiveLayout);
  window.addEventListener("orientationchange", () => {
    window.setTimeout(requestResponsiveLayout, 120);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", requestResponsiveLayout);
    window.visualViewport.addEventListener("scroll", requestResponsiveLayout);
  }

  if (window.ResizeObserver) {
    const layoutObserver = new ResizeObserver(() => {
      requestResponsiveLayout();
    });
    [appShell, gameCard, boardStage, canvasFrame, launcherPanel, hud].forEach((element) => {
      if (element) {
        layoutObserver.observe(element);
      }
    });
  }

  window.addEventListener("load", requestResponsiveLayout);
  window.setTimeout(requestResponsiveLayout, 0);

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      if (state.mode === "playing" && state.aiming) {
        fireBubble();
      } else {
        togglePause();
      }
    }
    if (event.code === "Escape") {
      togglePause();
    }
  });

  updateHud();
  updateStatus("시작 버튼을 누르면 20개 스테이지 챌린지가 시작돼요.");
  updateLauncherPreview();
  render();
  state.animationFrameId = window.requestAnimationFrame(gameLoop);
})();

