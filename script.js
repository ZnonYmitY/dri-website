function canonicalPagePath(pathname) {
  return pathname.replace(/\/index\.html$/, "/");
}

function pageIdFromPath(pathname) {
  const canonicalPath = canonicalPagePath(pathname);
  if (canonicalPath.endsWith("/")) return "index";
  const fileName = canonicalPath.split("/").filter(Boolean).pop() || "index";
  return fileName.replace(/\.html$/, "") || "index";
}

function legacyStorageKeys(pathname) {
  const canonicalPath = canonicalPagePath(pathname);
  const keys = new Set([canonicalPath]);
  if (canonicalPath.endsWith("/")) {
    keys.add(`${canonicalPath}index.html`);
  }
  return [...keys].map((path) => `ai-dri-guide-page-state:${path}`);
}

const PAGE_ID = pageIdFromPath(window.location.pathname);
const STORAGE_KEY = `ai-dri-guide-page-state:${PAGE_ID}`;
const LEGACY_STORAGE_KEYS = [
  ...legacyStorageKeys(window.location.pathname),
  `ai-dri-guide-page-state:${canonicalPagePath(window.location.pathname)}`,
].filter((key, index, keys) => key !== STORAGE_KEY && keys.indexOf(key) === index);
const GLOBAL_NAV_KEY = "ai-dri-guide-global-nav";
const GITHUB_CONFIG_KEY = "ai-dri-guide-github-config";
const CLOUD_STATE_URL = "site-state.json";
const CLOUD_STATE_PATH = "site-state.json";
const GITHUB_OWNER = "ZnonYmitY";
const GITHUB_REPO = "dri-website";
const GITHUB_BRANCH = "main";
const STATE_VERSION = 6;
const defaultNavLabels = {
  guide: "核心概念",
  map: "能力地图",
  cases: "常见误区",
  resources: "成长路径",
  about: "关于我们",
};
const navKeyByHref = {
  "guide.html": "guide",
  "map.html": "map",
  "cases.html": "cases",
  "resources.html": "resources",
  "index.html#about": "about",
};

const editableSelector = [
  "h1",
  "h2",
  "h3",
  "p",
  "a",
  "li",
  "summary",
  "strong",
  ".pill",
].join(",");

const nonEditableSelector = [
  ".editor-bar",
  ".popover",
  ".upload-chip",
  ".play",
  ".round-nav",
  ".quiz-dots",
  ".tag-popover",
  ".site-header .brand",
  ".site-header .nav a:not(.active)",
].join(",");

const quizQuestions = [
  {
    dimension: "认知定义",
    question: "在 AI 驱动的项目中，DRI 最关键的职责是什么？",
    options: [
      "A. 熟练使用工具完成任务",
      "B. 明确业务目标并设计可验证的价值路径",
      "C. 撰写完整的提示词让 AI 直接输出结果",
    ],
  },
  {
    dimension: "AI 协同素养",
    question: "你如何判断 AI 是否真的参与了价值创造？",
    options: [
      "A. 输出速度比人工更快",
      "B. 能减少返工，并让协同边界更清楚",
      "C. 能沉淀为团队持续复用的工作模式",
    ],
  },
  {
    dimension: "Agent 应用力",
    question: "设计 Agent 工作流时，你最先确认什么？",
    options: [
      "A. 使用哪个模型",
      "B. 任务步骤和人机交接点",
      "C. 目标、约束、评估和异常处理闭环",
    ],
  },
  {
    dimension: "评估 / 优化",
    question: "当 AI 结果不稳定时，你会优先做什么？",
    options: [
      "A. 多试几次直到结果可用",
      "B. 建立样例集和评估标准",
      "C. 追踪误差来源并迭代策略和流程",
    ],
  },
  {
    dimension: "上线迭代",
    question: "上线后的 AI 能力最需要关注什么？",
    options: [
      "A. 是否能正常访问",
      "B. 用户是否真的持续使用",
      "C. 是否能用数据闭环驱动版本迭代",
    ],
  },
  {
    dimension: "用户价值闭环",
    question: "一个 AI 项目是否成功，最终应看什么？",
    options: [
      "A. 页面和 Demo 是否完整",
      "B. 是否解决了明确用户问题",
      "C. 是否产生可衡量、可复用、可扩展的价值",
    ],
  },
  {
    dimension: "复利沉淀",
    question: "完成一次 AI 项目后，DRI 应该沉淀什么？",
    options: [
      "A. 项目截图和汇报材料",
      "B. 方法、评估、模板和复盘",
      "C. 可被下一轮直接调用的标准、流程与资产",
    ],
  },
];

const popoverContent = {
  problem: {
    title: "问题定义",
    text: "把模糊需求转化为清晰、可验证、可衡量的 AI 任务边界，决定 AI 做什么、为什么做、做到什么程度算有效。",
  },
  collab: {
    title: "AI 协同素养",
    text: "理解模型能力与限制，能拆分人机职责、设计反馈回路，并让 AI 成为稳定的协作伙伴。",
  },
  agent: {
    title: "Agent 应用力",
    text: "能把目标拆成流程、工具、记忆、检查点和异常处理机制，让 Agent 面向真实任务运行。",
  },
  evaluate: {
    title: "评估 / 优化",
    text: "通过样例、指标、人工校验和数据反馈判断产出质量，并持续优化提示、流程和工具组合。",
  },
  launch: {
    title: "上线迭代",
    text: "把 AI 能力放到真实使用场景中，追踪用户价值、风险和复用空间，形成持续迭代机制。",
  },
};

const conceptDetails = {
  llm: {
    title: "LLM",
    intro: "大语言模型，擅长理解、生成、总结、推理，但会犯错，也不天然懂业务。",
    points: [
      ["好", "它擅长什么", "理解文本、生成内容、信息提炼、基础推理。"],
      ["限", "它不擅长什么", "天然掌握企业知识、稳定执行复杂流程、自动保证正确。"],
      ["想", "你该如何理解", "LLM 是能力底座，不等于完整解决方案。"],
    ],
  },
  prompt: {
    title: "Prompt",
    intro: "Prompt 是任务说明和约束表达，先把目标、背景、角色、格式说清楚。",
    points: [
      ["写", "留出内容位置", "这里可放提示词结构、示例和常见改写方式。"],
      ["限", "不要只靠它", "复杂业务不能只靠一句提示词稳定解决。"],
      ["练", "你该如何理解", "Prompt 是沟通接口，不是完整系统。"],
    ],
  },
  rag: {
    title: "RAG",
    intro: "RAG 负责把外部知识带入模型回答，让 AI 不只依赖参数记忆。",
    points: [
      ["查", "留出内容位置", "这里可放知识库、检索、引用和更新机制。"],
      ["限", "需要补充什么", "检索质量、知识颗粒度和权限边界都要设计。"],
      ["用", "你该如何理解", "RAG 解决的是知识接入，不自动解决业务判断。"],
    ],
  },
  agent: {
    title: "Agent",
    intro: "Agent 把目标拆成步骤、工具调用、记忆和检查点，面向任务运行。",
    points: [
      ["跑", "留出内容位置", "这里可放工作流、工具、状态和异常处理。"],
      ["控", "需要补充什么", "越接近真实业务，越需要可观察、可回滚、可兜底。"],
      ["链", "你该如何理解", "Agent 是执行链路，不是放任 AI 自己发挥。"],
    ],
  },
  eval: {
    title: "Eval",
    intro: "Eval 是判断 AI 能否上线、是否可靠、如何持续优化的评估体系。",
    points: [
      ["测", "留出内容位置", "这里可放样例集、指标、人工校验和线上反馈。"],
      ["准", "需要补充什么", "评估要贴近真实任务，而不是只看单次回答好不好。"],
      ["迭", "你该如何理解", "Eval 决定 AI 能力能否从 Demo 走向生产。"],
    ],
  },
};

const dimensionDetails = [
  {
    title: "1. 用户洞察与问题定义",
    intro: "能否找到真正值得 AI 化的问题。",
    questions: "用户痛点是什么？问题是否足够具体？AI 介入后能带来可验证的价值吗？",
  },
  {
    title: "2. 领域知识与业务链路理解",
    intro: "能否理解上下游、指标、约束和业务后果。",
    questions: "这个任务处在什么业务链路里？输入输出依赖谁？失败会影响哪些结果？",
  },
  {
    title: "3. AI 机会判断",
    intro: "能否判断什么适合 AI，什么只是看起来适合。",
    questions: "这个问题为什么值得 AI 化？AI 能带来效率、质量还是体验增益？哪些环节其实不适合交给 AI？",
  },
  {
    title: "4. Agent 与工作流编排",
    intro: "能否把任务拆成可执行、可兜底、可持续迭代的链路。",
    questions: "任务步骤是什么？哪些步骤交给 AI，哪些保留人工确认？异常时如何中断和回退？",
  },
  {
    title: "5. 数据、知识与上下文工程",
    intro: "能否把业务经验沉淀为 AI 可用的知识资产。",
    questions: "AI 需要哪些上下文？知识如何组织和更新？数据权限、口径和质量如何保证？",
  },
  {
    title: "6. 评估、安全与质量闭环",
    intro: "能否判断 AI 是否可靠、是否值得上线。",
    questions: "如何构建样例集？质量阈值是什么？风险、误判和安全问题如何监控？",
  },
  {
    title: "7. 产品化、运营与组织推动",
    intro: "能否让 AI 能力被团队持续复用。",
    questions: "能力如何被更多人使用？谁负责运营和反馈？如何沉淀为平台、模板或规范？",
  },
];

let editing = false;
let currentQuestion = 0;
const answers = new Array(quizQuestions.length).fill(null);

let toggleEditButton;
let saveButton;
let exportButton;
let localSaveButton;
let refreshCloudButton;
let cloudSettingsButton;
let saveStatus;
let resultCard;
let popover;
let hasQuiz = false;
let globalEventsBound = false;

function refreshDomReferences() {
  toggleEditButton = document.getElementById("toggleEdit");
  saveButton = document.getElementById("savePage");
  exportButton = document.getElementById("exportHtml");
  saveStatus = document.getElementById("saveStatus");
  resultCard = document.getElementById("quizResult");
  popover = document.getElementById("definitionPopover");
  hasQuiz = !!document.getElementById("quizOptions");
  ensureCloudSettingsButton();
}

function ensureCloudSettingsButton() {
  const editorBar = document.querySelector(".editor-bar");
  if (!editorBar) return;
  if (saveButton) {
    saveButton.textContent = "发布云端";
  }

  localSaveButton = document.getElementById("saveLocal");
  if (!localSaveButton && saveButton) {
    localSaveButton = document.createElement("button");
    localSaveButton.className = "editor-button";
    localSaveButton.id = "saveLocal";
    localSaveButton.type = "button";
    localSaveButton.textContent = "保存本机";
    editorBar.insertBefore(localSaveButton, saveButton);
  }

  refreshCloudButton = document.getElementById("refreshCloud");
  if (!refreshCloudButton && saveButton) {
    refreshCloudButton = document.createElement("button");
    refreshCloudButton.className = "editor-button";
    refreshCloudButton.id = "refreshCloud";
    refreshCloudButton.type = "button";
    refreshCloudButton.textContent = "从云端刷新";
    editorBar.insertBefore(refreshCloudButton, exportButton || saveStatus || null);
  }

  cloudSettingsButton = document.getElementById("cloudSettings");
  if (!cloudSettingsButton) {
    cloudSettingsButton = document.createElement("button");
    cloudSettingsButton.className = "editor-button";
    cloudSettingsButton.id = "cloudSettings";
    cloudSettingsButton.type = "button";
    cloudSettingsButton.textContent = "连接 GitHub";
    editorBar.insertBefore(cloudSettingsButton, saveStatus || null);
  }
}

function editableElements() {
  return [...document.querySelectorAll(`.editable-scope ${editableSelector}`)].filter(
    (element) => !element.closest(nonEditableSelector),
  );
}

function clearEditingAttributes(root = document) {
  root.querySelectorAll("[contenteditable]").forEach((element) => {
    element.removeAttribute("contenteditable");
  });
  root.querySelectorAll("[spellcheck]").forEach((element) => {
    element.removeAttribute("spellcheck");
  });
}

function resetEditorUi(root = document) {
  const toggle = root.querySelector("#toggleEdit");
  if (toggle?.firstChild) {
    toggle.firstChild.textContent = "编辑模式";
  }
  root.querySelectorAll(".save-status").forEach((element) => {
    element.textContent = "";
  });
}

function setEditing(nextValue) {
  editing = nextValue;
  document.body.classList.toggle("editing", editing);
  if (toggleEditButton) {
    toggleEditButton.firstChild.textContent = editing ? "退出编辑" : "编辑模式";
  }
  editableElements().forEach((element) => {
    element.contentEditable = editing ? "true" : "false";
    if (editing) {
      element.setAttribute("spellcheck", "false");
    } else {
      element.removeAttribute("spellcheck");
      element.blur();
    }
  });
}

function installImageUploaders() {
  document.querySelectorAll(".upload-chip, input[data-upload-for]").forEach((element) => {
    element.remove();
  });

  document.querySelectorAll("[data-editable-image]").forEach((image, index) => {
    const host = image.closest(".media-card") || image.parentElement;
    if (!host) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.hidden = true;
    input.dataset.uploadFor = String(index);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "upload-chip";
    button.textContent = "上传图片";
    button.addEventListener("click", () => input.click());

    image.addEventListener("click", () => {
      if (editing) input.click();
    });

    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        image.src = String(reader.result);
        image.dataset.uploaded = "true";
        saveLocalState("图片已保存到本机");
      };
      reader.readAsDataURL(file);
    });

    host.append(input, button);
  });
}

function renderQuiz() {
  if (!hasQuiz) return;
  const item = quizQuestions[currentQuestion];
  document.getElementById("quizCount").textContent = `第 ${currentQuestion + 1} / ${quizQuestions.length} 题`;
  document.getElementById("quizQuestion").textContent = item.question;

  const optionContainer = document.getElementById("quizOptions");
  optionContainer.innerHTML = "";
  item.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option${answers[currentQuestion] === optionIndex ? " selected" : ""}`;
    button.textContent = option;
    button.dataset.level = String(optionIndex + 1);
    button.addEventListener("click", () => selectAnswer(optionIndex));
    optionContainer.append(button);
  });

  renderDots();
}

function renderDots() {
  const dotContainer = document.getElementById("quizDots");
  dotContainer.innerHTML = "";
  quizQuestions.forEach((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === currentQuestion ? "active" : "";
    button.setAttribute("aria-label", `跳转到第 ${index + 1} 题`);
    button.addEventListener("click", () => {
      currentQuestion = index;
      renderQuiz();
    });
    dotContainer.append(button);
  });
}

function selectAnswer(optionIndex) {
  answers[currentQuestion] = optionIndex;
  renderQuiz();
  if (answers.every((answer) => answer !== null)) {
    showResult();
    return;
  }
  if (currentQuestion < quizQuestions.length - 1) {
    currentQuestion += 1;
    window.setTimeout(renderQuiz, 180);
  }
}

function resultCopyForScore(score) {
  if (score <= 10) {
    return "你已经开始建立 AI DRI 意识。下一步可以先从问题定义和评估标准入手，把一次 AI 使用变成可复盘的业务实践。";
  }
  if (score <= 16) {
    return "你已具备良好的 AI 协同意识，能够对齐业务价值并驱动初步落地。建议进一步提升评估优化与复利沉淀能力，向卓越型 DRI 迈进。";
  }
  return "你已经具备较完整的 AI DRI 能力结构。下一步可以把方法、评估和工作流沉淀为团队资产，放大复用价值。";
}

function showResult({ scroll = true } = {}) {
  if (!resultCard) return;
  const score = answers.reduce((sum, value) => sum + value + 1, 0);
  const level = score <= 10 ? "入门型 AI DRI" : score <= 16 ? "进阶型 AI DRI" : "精通型 AI DRI";
  document.getElementById("resultLevel").textContent = level;
  document.getElementById("resultCopy").textContent = resultCopyForScore(score);
  resultCard.hidden = false;
  window.requestAnimationFrame(() => {
    resultCard.classList.add("is-visible");
    if (scroll) {
      window.setTimeout(() => {
        resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    }
  });
}

function setConcept(key) {
  const detail = conceptDetails[key];
  if (!detail) return;
  document.querySelectorAll("[data-concept]").forEach((button) => {
    button.classList.toggle("active", button.dataset.concept === key);
  });

  const fields = [
    ["conceptTitle", detail.title],
    ["conceptIntro", detail.intro],
    ["conceptIconOne", detail.points[0][0]],
    ["conceptPointTitleOne", detail.points[0][1]],
    ["conceptPointTextOne", detail.points[0][2]],
    ["conceptIconTwo", detail.points[1][0]],
    ["conceptPointTitleTwo", detail.points[1][1]],
    ["conceptPointTextTwo", detail.points[1][2]],
    ["conceptIconThree", detail.points[2][0]],
    ["conceptPointTitleThree", detail.points[2][1]],
    ["conceptPointTextThree", detail.points[2][2]],
  ];
  fields.forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

function setDimension(index) {
  const detail = dimensionDetails[index];
  if (!detail) return;
  document.querySelectorAll("[data-dimension]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.dimension) === index);
  });

  const title = document.getElementById("dimensionTitle");
  const intro = document.getElementById("dimensionIntro");
  const questions = document.getElementById("dimensionQuestions");
  if (title) title.textContent = detail.title;
  if (intro) intro.textContent = detail.intro;
  if (questions) questions.textContent = detail.questions;
  positionDimensionWheel(index);
}

function positionDimensionWheel(activeIndex = 0) {
  const wheel = document.getElementById("dimensionWheel");
  const nodes = [...document.querySelectorAll("[data-dimension]")];
  if (!wheel || nodes.length === 0) return;

  if (window.matchMedia("(max-width: 720px)").matches) {
    nodes.forEach((node) => {
      node.style.removeProperty("--node-x");
      node.style.removeProperty("--node-y");
    });
    wheel.style.setProperty("--wheel-rotation", "0deg");
    return;
  }

  const radius = window.matchMedia("(max-width: 1120px)").matches ? 240 : 250;
  const step = 360 / nodes.length;
  nodes.forEach((node, nodeIndex) => {
    const angle = (nodeIndex - activeIndex) * step;
    const radians = (angle * Math.PI) / 180;
    const x = Math.sin(radians) * radius;
    const y = -Math.cos(radians) * radius;
    node.style.setProperty("--node-x", `${x.toFixed(1)}px`);
    node.style.setProperty("--node-y", `${y.toFixed(1)}px`);
  });
  wheel.style.setProperty("--wheel-rotation", `${(-activeIndex * step).toFixed(2)}deg`);
}

function setCase(index) {
  const track = document.querySelector(".case-slide-track");
  if (!track) return;
  document.querySelectorAll("[data-case]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.case) === index);
  });
  track.style.transform = `translateX(-${index * 100}%)`;
}

function showPopover(key, anchor) {
  const content = popoverContent[key];
  if (!content || !popover) return;
  document.getElementById("popoverTitle").textContent = content.title;
  document.getElementById("popoverText").textContent = content.text;
  popover.hidden = false;

  const rect = anchor.getBoundingClientRect();
  const top = Math.min(window.innerHeight - 190, Math.max(96, rect.top - 30));
  popover.style.top = `${top}px`;
  popover.style.right = `${Math.max(24, window.innerWidth - rect.left + 18)}px`;
}

function closePopover() {
  if (!popover) return;
  popover.hidden = true;
}

function pageState() {
  const scopeClone = document.querySelector(".editable-scope").cloneNode(true);
  clearEditingAttributes(scopeClone);
  resetEditorUi(scopeClone);
  scopeClone.querySelectorAll(".upload-chip, input[data-upload-for]").forEach((element) => {
    element.remove();
  });
  return {
    version: STATE_VERSION,
    updatedAt: Date.now(),
    html: scopeClone.innerHTML,
    answers,
    currentQuestion,
  };
}

function normalizeNavLinks() {
  document.querySelectorAll(".site-header .nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!link.dataset.navKey && navKeyByHref[href]) {
      link.dataset.navKey = navKeyByHref[href];
    }
  });
}

function migratedNavLabels(labels) {
  const nextLabels = { ...labels };
  if (nextLabels.guide === "指南针") {
    nextLabels.guide = defaultNavLabels.guide;
  }
  if (nextLabels.cases === "实践案例") {
    nextLabels.cases = defaultNavLabels.cases;
  }
  if (nextLabels.resources === "资源库") {
    nextLabels.resources = defaultNavLabels.resources;
  }
  return nextLabels;
}

function navLabels() {
  normalizeNavLinks();
  return Array.from(document.querySelectorAll(".site-header .nav a[data-nav-key]")).reduce(
    (labels, link) => {
      labels[link.dataset.navKey] = link.textContent.trim();
      return labels;
    },
    {},
  );
}

function applyNavLabels() {
  normalizeNavLinks();
  let savedLabels = {};
  try {
    savedLabels = migratedNavLabels(JSON.parse(localStorage.getItem(GLOBAL_NAV_KEY) || "{}"));
  } catch {
    localStorage.removeItem(GLOBAL_NAV_KEY);
  }
  const labels = { ...defaultNavLabels, ...savedLabels };
  localStorage.setItem(GLOBAL_NAV_KEY, JSON.stringify(labels));
  document.querySelectorAll(".site-header .nav a[data-nav-key]").forEach((link) => {
    const label = labels[link.dataset.navKey];
    if (label) {
      link.textContent = label;
    }
  });
}

function githubConfig() {
  try {
    return JSON.parse(localStorage.getItem(GITHUB_CONFIG_KEY) || "{}");
  } catch {
    localStorage.removeItem(GITHUB_CONFIG_KEY);
    return {};
  }
}

function hasGithubToken() {
  return !!githubConfig().token;
}

function updateCloudSettingsButton() {
  if (!cloudSettingsButton) return;
  cloudSettingsButton.textContent = hasGithubToken() ? "GitHub 已连接" : "连接 GitHub";
}

function configureGithubToken() {
  const currentConfig = githubConfig();
  const token = window.prompt(
    "粘贴 GitHub fine-grained token（需要 Contents: Read and write）。token 只保存在当前浏览器，用于把编辑内容保存到仓库。",
    currentConfig.token ? "已配置，重新粘贴可覆盖" : "",
  );
  if (!token || token === "已配置，重新粘贴可覆盖") return;
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify({ token: token.trim() }));
  updateCloudSettingsButton();
  saveStatus.textContent = "云端已连接";
  window.setTimeout(() => {
    saveStatus.textContent = "";
  }, 1800);
}

function encodeBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64Utf8(text) {
  const binary = atob(text.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function loadCloudStateFromPages() {
  try {
    const response = await fetch(`${CLOUD_STATE_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchGithubState(token = "") {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CLOUD_STATE_PATH}?ref=${GITHUB_BRANCH}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    headers,
  });
  if (response.status === 404) {
    return { sha: null, state: { version: 1, pages: {}, navLabels: defaultNavLabels } };
  }
  if (!response.ok) {
    throw new Error("无法读取 GitHub 云端状态");
  }
  const data = await response.json();
  return {
    sha: data.sha,
    state: JSON.parse(decodeBase64Utf8(data.content || "")),
  };
}

async function loadCloudState() {
  try {
    return (await fetchGithubState()).state;
  } catch {
    return loadCloudStateFromPages();
  }
}

function saveLocalState(message = "已保存到本机") {
  localStorage.setItem(GLOBAL_NAV_KEY, JSON.stringify(navLabels()));
  const state = pageState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  if (saveStatus) {
    saveStatus.textContent = message;
    window.setTimeout(() => {
      saveStatus.textContent = "";
    }, 1800);
  }
  return state;
}

async function saveCloudState(state) {
  const { token } = githubConfig();
  if (!token) {
    configureGithubToken();
  }
  const config = githubConfig();
  if (!config.token) {
    throw new Error("未连接 GitHub，仅已保存本机");
  }

  saveStatus.textContent = "正在保存到云端...";
  const remote = await fetchGithubState(config.token);
  const cloudUpdatedAt = Date.now();
  const cloudPageState = {
    ...state,
    syncStatus: "cloud",
    cloudUpdatedAt,
  };
  const nextState = {
    version: 1,
    ...remote.state,
    pages: {
      ...(remote.state.pages || {}),
      [PAGE_ID]: cloudPageState,
    },
    navLabels: navLabels(),
    updatedAt: cloudUpdatedAt,
  };

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CLOUD_STATE_PATH}`;
  const body = {
    message: `Update site content for ${PAGE_ID}`,
    content: encodeBase64Utf8(`${JSON.stringify(nextState, null, 2)}\n`),
    branch: GITHUB_BRANCH,
  };
  if (remote.sha) {
    body.sha = remote.sha;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("云端保存失败，请检查 token 权限");
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudPageState));
  saveStatus.textContent = "已发布到云端，其他设备可刷新查看";
  window.setTimeout(() => {
    saveStatus.textContent = "";
  }, 2600);
}

async function publishState() {
  if (!saveStatus) return;
  const state = saveLocalState("已保存本机，正在发布...");
  try {
    await saveCloudState(state);
  } catch (error) {
    saveStatus.textContent = error.message || "发布失败，已保存本机";
    window.setTimeout(() => {
      saveStatus.textContent = "";
    }, 3200);
  }
}

function parseLocalState() {
  const stateKey = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS].find((key) => localStorage.getItem(key));
  const raw = stateKey ? localStorage.getItem(stateKey) : null;
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    if (state.version !== STATE_VERSION) {
      localStorage.removeItem(stateKey);
      return null;
    }
    if (stateKey !== STORAGE_KEY) {
      localStorage.setItem(STORAGE_KEY, raw);
      localStorage.removeItem(stateKey);
    }
    return state;
  } catch {
    localStorage.removeItem(stateKey || STORAGE_KEY);
    return null;
  }
}

function applyPageState(state) {
  if (!state) return;
  if (state.html) {
    document.querySelector(".editable-scope").innerHTML = state.html;
  }
  if (Array.isArray(state.answers)) {
    state.answers.slice(0, answers.length).forEach((answer, index) => {
      answers[index] = answer;
    });
  }
  if (Number.isInteger(state.currentQuestion)) {
    currentQuestion = Math.min(Math.max(state.currentQuestion, 0), quizQuestions.length - 1);
  }
}

async function refreshFromCloud({ force = true } = {}) {
  const cloudState = await loadCloudState();
  const cloudPageState = cloudState?.pages?.[PAGE_ID] || null;
  if (cloudState?.navLabels) {
    localStorage.setItem(GLOBAL_NAV_KEY, JSON.stringify(migratedNavLabels(cloudState.navLabels)));
  }
  if (!cloudPageState) {
    if (saveStatus) {
      saveStatus.textContent = "云端暂无此页面内容";
      window.setTimeout(() => {
        saveStatus.textContent = "";
      }, 1800);
    }
    applyNavLabels();
    return false;
  }
  if (!force) {
    const localState = parseLocalState();
    const localCloudUpdatedAt = localState?.cloudUpdatedAt || 0;
    const cloudUpdatedAt = cloudPageState.cloudUpdatedAt || cloudState.updatedAt || 0;
    if (cloudUpdatedAt <= localCloudUpdatedAt) return false;
  }
  applyPageState(cloudPageState);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudPageState));
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  clearEditingAttributes();
  refreshDomReferences();
  setEditing(false);
  installImageUploaders();
  renderQuiz();
  bindEvents();
  applyNavLabels();
  if (saveStatus) {
    saveStatus.textContent = "已从云端刷新";
    window.setTimeout(() => {
      saveStatus.textContent = "";
    }, 1800);
  }
  return true;
}

async function restoreState() {
  const localState = parseLocalState();
  const cloudState = await loadCloudState();
  const cloudPageState = cloudState?.pages?.[PAGE_ID] || null;
  if (cloudState?.navLabels) {
    localStorage.setItem(GLOBAL_NAV_KEY, JSON.stringify(migratedNavLabels(cloudState.navLabels)));
  }

  const localCloudUpdatedAt = localState?.cloudUpdatedAt || 0;
  const cloudUpdatedAt = cloudPageState?.cloudUpdatedAt || cloudState?.updatedAt || 0;
  const stateToApply = cloudPageState && cloudUpdatedAt > localCloudUpdatedAt ? cloudPageState : localState;
  if (stateToApply) {
    applyPageState(stateToApply);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToApply));
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }
  clearEditingAttributes();
  applyNavLabels();
}

function cleanCloneForExport() {
  const clone = document.documentElement.cloneNode(true);
  clone.querySelector("body")?.classList.remove("editing");
  clone.querySelector("body")?.classList.add("export-clean");
  clone.querySelectorAll("[contenteditable]").forEach((element) => {
    element.removeAttribute("contenteditable");
    element.removeAttribute("spellcheck");
  });
  clone.querySelectorAll(".upload-chip, input[type='file']").forEach((element) => element.remove());
  resetEditorUi(clone);
  return `<!doctype html>\n${clone.outerHTML}`;
}

function exportHtml() {
  const blob = new Blob([cleanCloneForExport()], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ai-dri-guide-edited.html";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  if (!saveStatus) return;
  saveStatus.textContent = "已导出";
  window.setTimeout(() => {
    saveStatus.textContent = "";
  }, 1800);
}

function bindEvents() {
  toggleEditButton?.addEventListener("click", () => setEditing(!editing));
  localSaveButton?.addEventListener("click", () => saveLocalState());
  saveButton?.addEventListener("click", publishState);
  refreshCloudButton?.addEventListener("click", () => refreshFromCloud());
  cloudSettingsButton?.addEventListener("click", configureGithubToken);
  exportButton?.addEventListener("click", exportHtml);

  document.getElementById("prevQuestion")?.addEventListener("click", () => {
    currentQuestion = (currentQuestion - 1 + quizQuestions.length) % quizQuestions.length;
    renderQuiz();
  });

  document.getElementById("nextQuestion")?.addEventListener("click", () => {
    currentQuestion = (currentQuestion + 1) % quizQuestions.length;
    renderQuiz();
  });

  document.querySelectorAll(".tag-popover").forEach((button) => {
    button.addEventListener("mouseenter", () => showPopover(button.dataset.popover, button));
    button.addEventListener("focus", () => showPopover(button.dataset.popover, button));
    button.addEventListener("mouseleave", closePopover);
    button.addEventListener("blur", closePopover);
  });

  document.querySelectorAll("[data-concept]").forEach((button) => {
    button.addEventListener("click", () => setConcept(button.dataset.concept));
  });

  document.querySelectorAll("[data-dimension]").forEach((button) => {
    button.addEventListener("click", () => setDimension(Number(button.dataset.dimension)));
  });
  positionDimensionWheel(
    Number(document.querySelector("[data-dimension].active")?.dataset.dimension || 0),
  );

  document.querySelectorAll("[data-case]").forEach((button) => {
    button.addEventListener("click", () => setCase(Number(button.dataset.case)));
  });

  if (globalEventsBound) return;
  globalEventsBound = true;

  window.addEventListener("resize", () => {
    positionDimensionWheel(
      Number(document.querySelector("[data-dimension].active")?.dataset.dimension || 0),
    );
  });

  document.addEventListener("input", (event) => {
    if (!editing || !event.target.closest(".site-header .nav a[data-nav-key]")) return;
    localStorage.setItem(GLOBAL_NAV_KEY, JSON.stringify(navLabels()));
  });

  document.addEventListener("keydown", (event) => {
    const navLink = event.target.closest(".site-header .nav a[data-nav-key]");
    if (!editing || !navLink) return;
    if (event.key === "Enter") {
      event.preventDefault();
      navLink.blur();
      localStorage.setItem(GLOBAL_NAV_KEY, JSON.stringify(navLabels()));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePopover();
    }
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (editing && link && link.closest(".editable-scope") && !link.closest(".site-header")) {
      event.preventDefault();
    }
  });
}

async function initPage() {
  await restoreState();
  refreshDomReferences();
  updateCloudSettingsButton();
  setEditing(false);
  installImageUploaders();
  renderQuiz();
  bindEvents();
  if (hasQuiz && answers.every((answer) => answer !== null)) {
    showResult({ scroll: false });
  }
}

initPage();
