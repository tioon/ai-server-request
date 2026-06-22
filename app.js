const workloadSelect = document.querySelector("#workload");
const gpuTierSelect = document.querySelector("#gpuTier");
const gpuPlatformSelect = document.querySelector("#gpuPlatform");
const gpuCountInput = document.querySelector("#gpuCount");
const siteTypeSelect = document.querySelector("#siteType");

const cpuValue = document.querySelector("#cpuValue");
const memoryValue = document.querySelector("#memoryValue");
const storageValue = document.querySelector("#storageValue");
const networkValue = document.querySelector("#networkValue");
const powerValue = document.querySelector("#powerValue");
const psuValue = document.querySelector("#psuValue");
const supportValue = document.querySelector("#supportValue");
const requestTemplate = document.querySelector("#requestTemplate");
const livePreview = document.querySelector("#livePreview");
const gpuCountLabel = document.querySelector("#gpuCountLabel");
const vendorGrid = document.querySelector("#vendorGrid");
const copyButton = document.querySelector("#copyButton");
const gpuPowerValue = document.querySelector("#gpuPowerValue");
const gpuConnectorValue = document.querySelector("#gpuConnectorValue");
const gpuExactnessValue = document.querySelector("#gpuExactnessValue");
const gpuRequiredPartsValue = document.querySelector("#gpuRequiredPartsValue");
const STORAGE_KEY = "ai-server-request-state";

const WORKLOADS = {
  inference: {
    label: "추론",
    cpu: "2-socket, 16-32 cores",
    memory: "256GB-384GB",
    storage: "OS NVMe RAID1 1TB / Data RAID5 4TB+",
    network: "10/25GbE x1",
    os: "Rocky Linux 9",
    support: "3y NBD/4H",
    power: "1.0-1.2kW",
    cooling: "air cooling",
    note: "CPU와 메모리 효율이 우선"
  },
  "fine-tuning": {
    label: "파인튜닝",
    cpu: "2-socket, 32-48 cores",
    memory: "384GB-512GB",
    storage: "OS NVMe RAID1 1TB / Data RAID5 8TB+",
    network: "25GbE x1",
    os: "Rocky Linux 9",
    support: "3y onsite",
    power: "1.2-1.5kW",
    cooling: "strong air cooling",
    note: "메모리와 PCIe 확장성이 중요"
  },
  training: {
    label: "학습",
    cpu: "2-socket, 48-64+ cores",
    memory: "512GB-1TB",
    storage: "OS NVMe RAID1 1TB / Data RAID5 4TB+",
    network: "25/100GbE x1",
    os: "Rocky Linux 9",
    support: "3y 4H",
    power: "1.8-2.5kW",
    cooling: "high-airflow cooling",
    note: "전력, 냉각, 네트워크가 핵심"
  },
  mixed: {
    label: "혼합",
    cpu: "2-socket, 32-64 cores",
    memory: "384GB-512GB",
    storage: "OS NVMe RAID1 1TB / Data RAID5 8TB+",
    network: "10/25GbE x1",
    os: "Rocky Linux 9",
    support: "3y onsite",
    power: "1.3-2.0kW",
    cooling: "air cooling",
    note: "운영성과 확장성의 균형"
  }
};

const GPU_OPTIONS = [
  {
    value: "RTX6000Ada",
    label: "RTX 6000 Ada",
    cpu: "2-socket, 16-32 cores",
    memory: "128GB-256GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "300W",
        connector: "1x 16-pin (12VHPWR / 12V-2x6)",
        exactness: "official reference",
        serverNeed: "PCIe chassis with a 16-pin GPU lead",
        psu: "2 x 1200W",
        requiredParts: "16-pin GPU power cable"
      }
    },
    fit: "dev/test, light inference",
    note: "워크스테이션 계열이지만 DC 추론에도 자주 사용"
  },
  {
    value: "L4",
    label: "L4",
    cpu: "1-socket, 8-16 cores",
    memory: "192GB-384GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "72W",
        connector: "slot-powered only",
        exactness: "official reference",
        serverNeed: "Any free x16 slot; no aux power lead",
        psu: "2 x 1200W",
        requiredParts: "No aux power lead"
      }
    },
    fit: "efficient inference",
    note: "비디오 AI, 저전력 추론"
  },
  {
    value: "L40S",
    label: "L40S",
    cpu: "1-socket, 16-24 cores",
    memory: "256GB-512GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "350W",
        connector: "1x 16-pin",
        exactness: "official reference",
        serverNeed: "Partner / NVIDIA-Certified chassis with a 16-pin GPU lead",
        psu: "2 x 1600W",
        requiredParts: "16-pin GPU power cable"
      }
    },
    fit: "inference, light tuning",
    note: "현재 데이터센터에서 가장 많이 보는 축"
  },
  {
    value: "L40",
    label: "L40",
    cpu: "1-socket, 16-24 cores",
    memory: "256GB-512GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "300W",
        connector: "1x 16-pin",
        exactness: "official reference",
        serverNeed: "PCIe chassis with a 16-pin GPU lead",
        psu: "2 x 1600W",
        requiredParts: "16-pin GPU power cable"
      }
    },
    fit: "graphics, visual AI, inference",
    note: "L40S보다 조금 덜 공격적인 범용 Ada 계열"
  },
  {
    value: "A2",
    label: "A2",
    cpu: "1-socket, 8-12 cores",
    memory: "128GB-256GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "70W",
        connector: "slot-powered only",
        exactness: "official reference",
        serverNeed: "Any free x16 slot; no aux power lead",
        psu: "2 x 800W",
        requiredParts: "No aux power lead"
      }
    },
    fit: "entry inference",
    note: "초경량 엣지/서비스용"
  },
  {
    value: "A10",
    label: "A10",
    cpu: "1-socket, 12-24 cores",
    memory: "128GB-256GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "150W class",
        connector: "1x 8-pin PCIe (reference add-in card)",
        exactness: "reference",
        serverNeed: "Server/workstation with one auxiliary 8-pin GPU lead",
        psu: "2 x 1200W",
        requiredParts: "8-pin GPU power cable"
      }
    },
    fit: "general inference",
    note: "비교적 오래 쓰인 범용 GPU"
  },
  {
    value: "T4",
    label: "T4",
    cpu: "1-socket, 8-12 cores",
    memory: "128GB-256GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "70W",
        connector: "slot-powered only",
        exactness: "official reference",
        serverNeed: "Any free x16 slot; no aux power lead",
        psu: "2 x 800W",
        requiredParts: "No aux power lead"
      }
    },
    fit: "legacy inference",
    note: "레거시 추론 / 인코딩"
  },
  {
    value: "A30",
    label: "A30",
    cpu: "1-socket, 16-24 cores",
    memory: "256GB-384GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "165W class",
        connector: "1x 8-pin PCIe (reference add-in card)",
        exactness: "reference",
        serverNeed: "Server/workstation with one auxiliary 8-pin GPU lead",
        psu: "2 x 1200W",
        requiredParts: "8-pin GPU power cable"
      }
    },
    fit: "balanced inference",
    note: "메모리 밸런스가 좋음"
  },
  {
    value: "A40",
    label: "A40",
    cpu: "1-socket or 2-socket, 16-32 cores",
    memory: "256GB-384GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "300W",
        connector: "OEM/server-specific harness",
        exactness: "SKU-specific",
        serverNeed: "OEM-qualified platform with the matching GPU harness",
        psu: "2 x 1200W",
        requiredParts: "OEM GPU harness"
      }
    },
    fit: "visual AI, inference",
    note: "비전/그래픽 작업에 자주 쓰임"
  },
  {
    value: "A100",
    label: "A100",
    cpu: "2-socket, 32-64 cores",
    memory: "512GB-1TB",
    platforms: ["PCIe", "SXM"],
    variants: {
      PCIe: {
        tdp: "SKU-specific",
        connector: "OEM/server-specific harness",
        exactness: "SKU-specific",
        serverNeed: "PCIe carrier and exact OEM harness for this A100 SKU",
        psu: "2 x 2000W",
        requiredParts: "Exact A100 PCIe harness"
      },
      SXM: {
        tdp: "SKU-specific",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "HGX A100 baseboard and matching platform",
        psu: "HGX power budget",
        requiredParts: "HGX A100 baseboard"
      }
    },
    fit: "training, high-end inference",
    note: "엔터프라이즈 학습의 기준점"
  },
  {
    value: "H100",
    label: "H100",
    cpu: "2-socket, 32-64 cores",
    memory: "512GB-1TB",
    platforms: ["PCIe", "SXM"],
    variants: {
      PCIe: {
        tdp: "350W",
        connector: "1x 16-pin",
        exactness: "official PCIe reference",
        serverNeed: "PCIe carrier with a 16-pin GPU lead",
        psu: "2 x 2000W",
        requiredParts: "16-pin GPU power cable"
      },
      SXM: {
        tdp: "700W class",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "HGX H100 baseboard and matched cooling",
        psu: "HGX power budget",
        requiredParts: "HGX H100 baseboard"
      }
    },
    fit: "heavy training",
    note: "현행 고성능 학습"
  },
  {
    value: "H200",
    label: "H200",
    cpu: "2-socket, 48-64+ cores",
    memory: "1TB-2TB",
    platforms: ["PCIe", "SXM"],
    variants: {
      PCIe: {
        tdp: "SKU-specific",
        connector: "OEM/server-specific harness",
        exactness: "SKU-specific",
        serverNeed: "PCIe carrier for the exact H200 SKU",
        psu: "2 x 3000W",
        requiredParts: "Exact H200 PCIe harness"
      },
      SXM: {
        tdp: "SKU-specific",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "HGX H200 baseboard and matching platform",
        psu: "HGX power budget",
        requiredParts: "HGX H200 baseboard"
      }
    },
    fit: "large-scale training",
    note: "큰 메모리 대역폭이 필요한 경우"
  },
  {
    value: "B200",
    label: "B200 / Blackwell",
    cpu: "2-socket, 48-96+ cores",
    memory: "1TB-2TB",
    platforms: ["SXM"],
    variants: {
      SXM: {
        tdp: "HGX platform-specific",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "NVIDIA HGX with 8 Blackwell SXMs",
        psu: "2 x 3000W",
        requiredParts: "HGX Blackwell baseboard"
      }
    },
    fit: "next-gen training",
    note: "차세대 랙 전력 예산 필요"
  },
  {
    value: "B300",
    label: "B300 / Blackwell",
    cpu: "2-socket, 48-96+ cores",
    memory: "1TB-2TB",
    platforms: ["SXM"],
    variants: {
      SXM: {
        tdp: "platform-specific",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "HGX Blackwell platform with matching SXM baseboard",
        psu: "2 x 3000W",
        requiredParts: "HGX Blackwell baseboard"
      }
    },
    fit: "next-gen training",
    note: "Blackwell 세대의 SXM 기준"
  }
];

const VENDORS = [
  {
    vendor: "HPE",
    model: "ProLiant DL360 Gen11",
    badge: "compact inference",
    summary: "저전력 GPU와 단일 소켓 구성에 잘 맞는 1U 기준선.",
    fit: ["A2", "T4", "L4", "RTX6000Ada"],
    platforms: ["PCIe"],
    capacityLevel: 1,
    accent: ["#5cc9ff", "#0e2136"],
    specs: {
      formFactor: "1U single/dual-socket",
      pcie: "PCIe Gen5 compact expansion",
      gpuClass: "entry inference / low-profile GPU",
      power: "Best when you want density without oversized chassis",
      serverNeed: "Good fit for low-power or low-profile PCIe GPUs"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R660",
    badge: "efficient rack server",
    summary: "L4, A2, T4 같은 저전력 GPU에 맞는 효율적인 1U/2U 중간 지점.",
    fit: ["A2", "T4", "L4", "RTX6000Ada", "A10"],
    platforms: ["PCIe"],
    capacityLevel: 1,
    accent: ["#67f0c7", "#0b2a1d"],
    specs: {
      formFactor: "1U dual-socket",
      pcie: "PCIe Gen5 efficient expansion",
      gpuClass: "compact inference / service nodes",
      power: "Better when you do not need a large 2U GPU chassis",
      serverNeed: "Good for low-to-mid power PCIe GPU deployments"
    }
  },
  {
    vendor: "HPE",
    model: "ProLiant DL380 Gen11",
    badge: "balanced enterprise",
    summary: "범용 AI 인프라와 추론형 서비스에 잘 맞는 2U 기준선.",
    fit: ["L4", "L40", "L40S", "A10", "A40"],
    platforms: ["PCIe"],
    capacityLevel: 2,
    accent: ["#6ee7ff", "#10263b"],
    specs: {
      formFactor: "2U dual-socket",
      pcie: "PCIe Gen5 balanced expansion",
      gpuClass: "1-4 GPU inference / mixed",
      power: "Good default when you need balance",
      serverNeed: "Balanced 2U chassis for mixed CPU, storage, and GPU loads"
    }
  },
  {
    vendor: "HPE",
    model: "ProLiant DL385 Gen11",
    badge: "AMD GPU-friendly",
    summary: "PCIe 여유와 확장성이 좋아 GPU 수량이 늘어날수록 편함.",
    fit: ["L40", "L40S", "A100", "H100"],
    platforms: ["PCIe"],
    capacityLevel: 3,
    accent: ["#8cffc1", "#0d2d23"],
    specs: {
      formFactor: "2U dual-socket",
      pcie: "PCIe Gen5 lane-heavy",
      gpuClass: "heavier PCIe GPU configs",
      power: "Best when PCIe lanes and capacity matter",
      serverNeed: "Better fit when you expect more PCIe cards or denser GPU builds"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R760",
    badge: "general-purpose",
    summary: "추론, 혼합, 운영형 AI에서 가장 무난한 기준점.",
    fit: ["RTX6000Ada", "L4", "L40", "L40S", "A10"],
    platforms: ["PCIe"],
    capacityLevel: 2,
    accent: ["#ffb86b", "#33210e"],
    specs: {
      formFactor: "2U dual-socket",
      pcie: "PCIe balanced expansion",
      gpuClass: "general-purpose inference",
      power: "Strong default for mixed CPU/GPU workloads",
      serverNeed: "Works well for 1-4 GPU deployments and day-to-day operations"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge XE9680",
    badge: "training flagship",
    summary: "고밀도 GPU 학습과 큰 전력 예산에 맞는 플래그십.",
    fit: ["A100", "H100", "H200", "B200", "B300"],
    platforms: ["PCIe", "SXM"],
    capacityLevel: 4,
    accent: ["#ff8bb1", "#331127"],
    specs: {
      formFactor: "4U GPU server",
      pcie: "high-density GPU platform",
      gpuClass: "dense training / max GPU count",
      power: "Use when thermal and power budget are high",
      serverNeed: "Best for dense GPU training where airflow and power budget are generous"
    }
  }
];

function getGpu(value) {
  return GPU_OPTIONS.find((item) => item.value === value) || GPU_OPTIONS[0];
}

const LEGACY_GPU_ALIASES = {
  "A100-40": { gpuTier: "A100", gpuPlatform: "PCIe" },
  "A100-80": { gpuTier: "A100", gpuPlatform: "PCIe" },
  "H100-PCIe": { gpuTier: "H100", gpuPlatform: "PCIe" }
};

function getGpuVariant(gpu, platform) {
  return gpu.variants?.[platform] || gpu.variants?.[gpu.platforms?.[0]] || {};
}

function getGpuDemandLevel(gpuValue) {
  return {
    A2: 1,
    T4: 1,
    L4: 1,
    RTX6000Ada: 2,
    A10: 2,
    A30: 2,
    L40: 2,
    L40S: 3,
    A40: 3,
    A100: 4,
    H100: 4,
    H200: 5,
    B200: 6,
    B300: 6
  }[gpuValue] || 2;
}

function resolveCpuSpec(gpu, gpuCount, workloadKey) {
  const profiles = {
    L4: {
      1: "1-socket, 8-12 cores",
      2: "1-socket, 12-16 cores",
      4: "1-socket or 2-socket, 16-24 cores",
      8: "2-socket, 24-32 cores"
    },
    L40: {
      1: "1-socket, 16-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    L40S: {
      1: "1-socket, 16-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    RTX6000Ada: {
      1: "1-socket, 16-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    A10: {
      1: "1-socket, 12-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    A30: {
      1: "1-socket, 16-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    A40: {
      1: "1-socket or 2-socket, 16-32 cores",
      2: "2-socket, 16-32 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    A100: {
      1: "2-socket, 32-48 cores",
      2: "2-socket, 32-64 cores",
      4: "2-socket, 48-64 cores",
      8: "2-socket, 64+ cores"
    },
    H100: {
      1: "2-socket, 32-48 cores",
      2: "2-socket, 32-64 cores",
      4: "2-socket, 48-64 cores",
      8: "2-socket, 64+ cores"
    },
    H200: {
      1: "2-socket, 48-64 cores",
      2: "2-socket, 48-64+ cores",
      4: "2-socket, 64+ cores",
      8: "2-socket, 64+ cores"
    },
    B200: {
      1: "2-socket, 48-96+ cores",
      2: "2-socket, 64+ cores",
      4: "2-socket, 64+ cores",
      8: "2-socket, 64+ cores"
    },
    B300: {
      1: "2-socket, 48-96+ cores",
      2: "2-socket, 64+ cores",
      4: "2-socket, 64+ cores",
      8: "2-socket, 64+ cores"
    }
  };

  const countBucket = gpuCount >= 8 ? 8 : gpuCount >= 4 ? 4 : gpuCount >= 2 ? 2 : 1;
  const baseProfile = profiles[gpu.value]?.[countBucket];
  if (baseProfile) {
    return workloadKey === "training" && (gpu.value === "A100" || gpu.value === "H100" || gpu.value === "H200" || gpu.value === "B200" || gpu.value === "B300")
      ? `${baseProfile} (train-friendly)`
      : baseProfile;
  }

  return gpu.cpu;
}

function getDefaultGpuValue(platform) {
  return platform === "SXM" ? "H100" : "L40S";
}

function getCompatibleGpuOptions(platform) {
  return GPU_OPTIONS.filter((item) => item.platforms.includes(platform));
}

function normalizeGpuSelection(rawGpu, rawPlatform) {
  if (rawGpu && LEGACY_GPU_ALIASES[rawGpu]) {
    return {
      ...LEGACY_GPU_ALIASES[rawGpu],
      gpuPlatform: rawPlatform || LEGACY_GPU_ALIASES[rawGpu].gpuPlatform
    };
  }

  if (!rawGpu) {
    return {
      gpuTier: getDefaultGpuValue(rawPlatform || "PCIe"),
      gpuPlatform: rawPlatform || "PCIe"
    };
  }

  if (rawGpu.endsWith("-PCIe") || rawGpu.endsWith("-SXM")) {
    const suffix = rawGpu.endsWith("-PCIe") ? "PCIe" : "SXM";
    const family = rawGpu.slice(0, -(suffix.length + 1));
    return {
      gpuTier: family,
      gpuPlatform: suffix || rawPlatform || "PCIe"
    };
  }

  return {
    gpuTier: rawGpu,
    gpuPlatform: rawPlatform || "PCIe"
  };
}

function getSelectedOptions() {
  const params = new URLSearchParams(window.location.search);
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  })();
  const normalized = normalizeGpuSelection(
    params.get("gpu") || stored?.gpuTier || "",
    params.get("platform") || params.get("gpuPlatform") || stored?.gpuPlatform || ""
  );

  return {
    workload: params.get("workload") || stored?.workload || "inference",
    gpuTier: normalized.gpuTier || getDefaultGpuValue(normalized.gpuPlatform),
    gpuPlatform: normalized.gpuPlatform || "PCIe",
    gpuCount: params.get("count") || stored?.gpuCount || "2",
    siteType: params.get("site") || stored?.siteType || "datacenter"
  };
}

function persistState(nextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }

  const url = new URL(window.location.href);
  url.searchParams.set("workload", nextState.workload);
  url.searchParams.set("gpu", nextState.gpuTier);
  url.searchParams.set("platform", nextState.gpuPlatform);
  url.searchParams.set("count", String(nextState.gpuCount));
  url.searchParams.set("site", nextState.siteType);
  history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
}

function estimatedLoad(workloadKey, gpu, gpuCount, siteType, gpuPlatform) {
  const workloadLoad = {
    inference: [0.7, 1.2],
    "fine-tuning": [1.1, 1.5],
    training: [1.8, 2.5],
    mixed: [1.3, 2.0]
  }[workloadKey] || [1.0, 1.2];

  const gpuLoad = {
    RTX6000Ada: [0.7, 0.9],
    L4: [0.7, 1.0],
    L40S: [1.2, 1.4],
    A2: [0.4, 0.7],
    A10: [0.6, 0.9],
    T4: [0.35, 0.6],
    A30: [0.8, 1.1],
    A40: [0.9, 1.2],
    L40: [1.0, 1.3],
    A100: [1.6, 2.4],
    H100: [2.0, 3.0],
    H200: [2.4, 3.6],
    B200: [3.0, 4.2],
    B300: [3.0, 4.2]
  }[gpu.value] || [1.0, 1.2];

  const platformLoadAdj = gpuPlatform === "SXM" ? 0.45 : 0;
  const siteLoadAdj = siteType === "edge" ? -0.05 : siteType === "office" ? 0.1 : 0;
  const low = Math.max(workloadLoad[0], gpuLoad[0]) + Math.max(0, gpuCount - 1) * 0.22 + siteLoadAdj;
  const high = Math.max(workloadLoad[1], gpuLoad[1]) + Math.max(0, gpuCount - 1) * 0.32 + siteLoadAdj + platformLoadAdj;
  return [Math.max(0.3, low), Math.max(low + 0.1, high)];
}

function powerBand(loadHigh, gpu, gpuPlatform) {
  if (gpu.value === "B200" || (gpu.value === "H200" && gpuPlatform === "SXM")) return "2 x 3000W";
  if (gpu.value === "B300") return "HGX power shelf / 2 x 3000W";
  if (gpu.value === "H100" && gpuPlatform === "SXM") return "HGX power shelf / 2 x 3000W";
  if (gpu.value === "H100" && gpuPlatform === "PCIe") return "2 x 2000W";
  if (gpu.value === "H200" && gpuPlatform === "PCIe") return "2 x 3000W";
  if (gpu.value === "A100" && gpuPlatform === "SXM") return "HGX power shelf / 2 x 3000W";
  if (gpu.value === "A100" && gpuPlatform === "PCIe") return "2 x 2000W";
  if (gpu.value === "L40S") return "2 x 1600W";
  if (gpu.value === "L40") return "2 x 1600W";
  if (gpu.value === "L4" || gpu.value === "RTX6000Ada" || gpu.value === "A10" || gpu.value === "A40") return loadHigh <= 1.0 ? "2 x 1200W" : "2 x 1600W";
  if (gpu.value === "A2" || gpu.value === "T4") return "2 x 800W";
  return loadHigh <= 1.0 ? "2 x 1200W" : "2 x 1600W";
}

function formatRange([low, high]) {
  return `${low.toFixed(1)}-${high.toFixed(1)}kW`;
}

function buildRequestText(state) {
  return `AI 서버 구매 요청서

워크로드: ${state.workload.label}
GPU: ${state.gpu.label} / ${state.gpuPlatform} x${state.gpuCount}
설치 환경: ${state.siteLabel}

권장 기본값
- CPU: ${state.cpu}
- 메모리: ${state.memory}
- 저장장치: ${state.storage}
- 네트워크: ${state.network}
- OS: ${state.os}
- 지원: ${state.support}
- GPU 전력: ${state.gpuPower}
- GPU 커넥터: ${state.gpuConnector}
- GPU 필수 부품: ${state.gpuRequiredParts}
- GPU 전원 기준: ${state.gpuExactness}
- GPU 서버 요건: ${state.gpuServerNeed}
- 전력/냉각: ${state.powerText}
- PSU: ${state.psuText}

요청사항
- 하드웨어 / 유지보수 / 설치 / 전력냉각 / TCO를 분리해 견적
- 대안 모델 2개 제시
- GPU 총 전력과 PSU 정격을 함께 표기
- 데이터센터 또는 오피스 환경에 맞는 냉각 수치 제시
- 저장장치는 OS RAID1, Data RAID5 기준으로 제안`;
}

function fallbackSvg(vendor, model, accentA = "#1f3552", accentB = "#0d1726") {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg viewBox="0 0 960 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${vendor} ${model}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accentA}" />
          <stop offset="100%" stop-color="${accentB}" />
        </linearGradient>
      </defs>
      <rect width="960" height="440" rx="28" fill="#09111e" />
      <rect x="34" y="34" width="892" height="372" rx="24" fill="url(#g)" opacity="0.96" />
      <rect x="126" y="98" width="708" height="198" rx="18" fill="#07101c" stroke="rgba(255,255,255,0.16)" />
      <rect x="150" y="124" width="660" height="24" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="150" y="162" width="660" height="24" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="150" y="200" width="660" height="24" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="150" y="238" width="660" height="24" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="126" y="316" width="708" height="34" rx="14" fill="rgba(255,255,255,0.12)" />
      <text x="68" y="74" font-family="Space Grotesk, sans-serif" font-size="28" font-weight="700" fill="#f5f8ff">${vendor}</text>
      <text x="68" y="392" font-family="Space Grotesk, sans-serif" font-size="24" font-weight="600" fill="#f5f8ff">${model}</text>
    </svg>
  `)}`;
}

function makeVendorCard(vendor, state) {
  const card = document.createElement("article");
  card.className = "card vendor-card";
  const supportsPlatform = vendor.platforms?.includes(state.gpuPlatform) ?? true;
  const demandLevel = getGpuDemandLevel(state.gpu.value);
  const capacityLevel = vendor.capacityLevel || 2;
  const capacityScore = Math.max(0, 4 - Math.abs(capacityLevel - demandLevel));
  const score = (vendor.fit.includes(state.gpu.value) ? 4 : 0) + (supportsPlatform ? 2 : 0) + capacityScore;
  const fallback = fallbackSvg(vendor.vendor, vendor.model, vendor.accent[0], vendor.accent[1]);
  const fitReason = vendor.fit.includes(state.gpu.value)
    ? `현재 선택한 ${state.gpu.label} / ${state.gpuPlatform}와 맞습니다.`
    : supportsPlatform
      ? `${state.gpuPlatform} 폼팩터는 받을 수 있지만 GPU 세부 모델은 다시 확인하는 편이 좋습니다.`
      : `${state.gpuPlatform} 폼팩터 기준으로는 직접 매칭이 약합니다.`;

  card.innerHTML = `
    <div class="server-art server-art--fallback">
      <img src="${fallback}" alt="${vendor.vendor} ${vendor.model} 서버 이미지" loading="lazy" />
    </div>
    <div class="vendor-copy">
      <div class="vendor-top">
        <div>
          <span class="vendor-badge">${vendor.badge}</span>
          <h3>${vendor.vendor} ${vendor.model}</h3>
        </div>
        ${score > 0 ? '<span class="best-pill">추천</span>' : ""}
      </div>
      <p>${vendor.summary}</p>
      <div class="vendor-reason">
        <span>추천 이유</span>
        <strong>${fitReason}</strong>
      </div>
      <div class="vendor-specs">
        <div class="vendor-spec">
          <span>폼팩터</span>
          <strong>${vendor.specs.formFactor}</strong>
        </div>
        <div class="vendor-spec">
          <span>PCIe / 확장</span>
          <strong>${vendor.specs.pcie}</strong>
        </div>
        <div class="vendor-spec">
          <span>GPU 적합도</span>
          <strong>${vendor.specs.gpuClass}</strong>
        </div>
        <div class="vendor-spec">
          <span>전원/열</span>
          <strong>${vendor.specs.power}</strong>
        </div>
        <div class="vendor-spec">
          <span>서버 요건</span>
          <strong>${vendor.specs.serverNeed}</strong>
        </div>
      </div>
      <div class="vendor-meta">
        <span>적합 GPU</span>
        <strong>${vendor.fit.join(" / ")}${vendor.platforms ? ` · ${vendor.platforms.join(" / ")}` : ""}</strong>
      </div>
    </div>
  `;

  if (score > 0) {
    card.classList.add("is-best");
  }

  return card;
}

function renderGpuOptions(platform, selectedValue) {
  const compatible = getCompatibleGpuOptions(platform);
  const fallbackValue = selectedValue && compatible.some((gpu) => gpu.value === selectedValue)
    ? selectedValue
    : getDefaultGpuValue(platform);

  gpuTierSelect.innerHTML = compatible
    .map((gpu) => `<option value="${gpu.value}"${gpu.value === fallbackValue ? " selected" : ""}>${gpu.label}</option>`)
    .join("");

  gpuTierSelect.value = fallbackValue;
  return fallbackValue;
}

function render() {
  const workloadKey = workloadSelect.value;
  const siteType = siteTypeSelect.value;
  const gpuPlatform = gpuPlatformSelect.value;
  const gpuValue = renderGpuOptions(gpuPlatform, gpuTierSelect.value);
  const gpu = getGpu(gpuValue);
  const gpuVariant = getGpuVariant(gpu, gpuPlatform);
  const gpuCount = Number(gpuCountInput.value);
  const workload = WORKLOADS[workloadKey];
  const load = estimatedLoad(workloadKey, gpu, gpuCount, siteType, gpuPlatform);
  const powerBandText = powerBand(load[1], gpu, gpuPlatform);
  const siteLabel = siteType === "datacenter" ? "데이터센터" : siteType === "office" ? "오피스/서버실" : "엣지/분산 설치";
  const cpuSpec = resolveCpuSpec(gpu, gpuCount, workloadKey);

  const state = {
    workload,
    gpu,
    gpuPlatform,
    gpuVariant,
    gpuCount,
    siteLabel,
    cpu: cpuSpec,
    memory: workloadKey === "training" && gpu.memory !== "1TB-2TB" ? "512GB-1TB" : gpu.memory,
    storage: workload.storage,
    network: siteType === "office" ? "10/25GbE x1" : siteType === "edge" ? "10GbE x1" : workload.network,
    os: workload.os,
    support: workload.support,
    gpuPower: gpuVariant.tdp || "SKU-specific",
    gpuConnector: gpuVariant.connector || "SKU-specific",
    gpuExactness: gpuVariant.exactness || "SKU-specific",
    gpuServerNeed: gpuVariant.serverNeed || "Check exact SKU before ordering",
    gpuRequiredParts: gpuVariant.requiredParts || "Check exact SKU before ordering",
    powerText: `${formatRange(load)}, ${powerBandText}, ${siteType === "office" ? "office cooling margin" : siteType === "edge" ? "edge airflow margin" : workload.cooling}`,
    psuText: `${powerBandText}, 1+1 redundant`
  };

  gpuCountLabel.textContent = String(gpuCount);
  cpuValue.textContent = state.cpu;
  memoryValue.textContent = state.memory;
  storageValue.textContent = state.storage;
  networkValue.textContent = state.network;
  powerValue.textContent = state.powerText;
  psuValue.textContent = state.psuText;
  gpuPowerValue.textContent = state.gpuPower;
  gpuConnectorValue.textContent = state.gpuConnector;
  gpuExactnessValue.textContent = state.gpuExactness;
  gpuRequiredPartsValue.textContent = state.gpuRequiredParts;
  supportValue.textContent = state.support;

  livePreview.textContent = [
    `워크로드: ${state.workload.label}`,
    `GPU: ${state.gpu.label} / ${state.gpuPlatform} x${state.gpuCount}`,
    `CPU: ${state.cpu}`,
    `GPU 전력: ${state.gpuPower}`,
    `GPU 커넥터: ${state.gpuConnector}`,
    `필수 부품: ${state.gpuRequiredParts}`,
    `전원 기준: ${state.gpuExactness}`,
    `서버 요건: ${state.gpuServerNeed}`,
    `전력: ${state.powerText}`,
    `냉각: ${siteType === "datacenter" ? "rack-optimized" : siteType === "office" ? "office-safe" : "edge-safe"}`,
    `포커스: ${state.workload.note}`
  ].join("\n");

  requestTemplate.textContent = buildRequestText(state);
  const ranked = VENDORS
    .map((vendor, index) => ({
      vendor,
      index,
      score:
        (vendor.fit.includes(state.gpu.value) ? 4 : 0) +
        ((vendor.platforms?.includes(state.gpuPlatform) ?? true) ? 2 : 0) +
        Math.max(0, 4 - Math.abs((vendor.capacityLevel || 2) - getGpuDemandLevel(state.gpu.value))) +
        (vendor.vendor === "Dell" && state.gpu.value === "H100" && state.gpuPlatform === "PCIe" ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const topScore = ranked[0]?.score || 0;
  vendorGrid.replaceChildren(
    ...ranked.map(({ vendor, score }) => {
      const card = makeVendorCard(vendor, state);
      if (score === topScore && topScore > 0) {
        card.classList.add("is-best");
      }
      return card;
    })
  );
  copyButton.dataset.copy = requestTemplate.textContent;
  persistState({
    workload: workloadKey,
    gpuTier: gpu.value,
    gpuPlatform,
    gpuCount,
    siteType
  });
}

async function copyRequest() {
  const text = copyButton.dataset.copy || "";
  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = "복사됨";
  } catch {
    copyButton.textContent = "복사 실패";
  }
  setTimeout(() => {
    copyButton.textContent = "복사";
  }, 1200);
}

const initial = getSelectedOptions();
workloadSelect.value = initial.workload;
gpuPlatformSelect.value = initial.gpuPlatform;
renderGpuOptions(initial.gpuPlatform, initial.gpuTier);
gpuCountInput.value = initial.gpuCount;
siteTypeSelect.value = initial.siteType;

workloadSelect.addEventListener("change", render);
gpuTierSelect.addEventListener("change", render);
gpuPlatformSelect.addEventListener("change", render);
gpuCountInput.addEventListener("input", render);
siteTypeSelect.addEventListener("change", render);
copyButton.addEventListener("click", copyRequest);

render();
