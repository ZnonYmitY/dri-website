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
  ".dashed-placeholder",
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
    id: "base",
    dimension: "基础认知层",
    question:
      "场景：业务同学提出“能不能用 AI 做一个自动生成短视频脚本的功能”，希望你当天给出初步判断。你最可能先怎么做？",
    options: [
      {
        text: "A. 先找几个主流 AI 工具试一下，让模型生成几版脚本，看看效果是否像样；同时请算法或工程同学帮忙判断大概能不能做。",
        level: "pro",
      },
      {
        text: "B. 先拆清楚任务类型、输入输出、风格控制和结构化要求；再比较 Prompt、工作流、微调等方案的成本、效果和边界。",
        level: "max5",
      },
      {
        text: "C. 先判断这个能力在业务链路里的长期价值，再反推技术路线、数据需求、评测方式和阶段性投入节奏。",
        level: "max20",
      },
    ],
  },
  {
    id: "guard",
    dimension: "落地保障层",
    question: "一个 AI Demo 看起来效果不错，准备上线前你最关注什么？",
    options: [
      {
        text: "A. 先确认主要流程能跑通，关键 bad case 不太离谱，有基础兜底方案。",
        level: "pro",
      },
      {
        text: "B. 建立评测指标、样例集、灰度策略、回退方案和风险边界，确认上线后如何观察效果。",
        level: "max5",
      },
      {
        text: "C. 把 Eval、工程化、安全、成本和线上反馈设计成持续运转的保障体系，而不是一次性上线检查。",
        level: "max20",
      },
    ],
  },
  {
    id: "efficiency",
    dimension: "应用提效层",
    question: "你更常如何把 AI 用进团队日常工作？",
    options: [
      {
        text: "A. 主要用于个人写作、总结、分析或生成内容，明显提升自己的工作效率。",
        level: "pro",
      },
      {
        text: "B. 把多个 AI 工具串成团队可复用流程，服务周报、分析、创意、运营等高频任务。",
        level: "max5",
      },
      {
        text: "C. 重新设计跨角色、跨环节的协作方式，让 AI 进入真实业务流程并持续验证收益。",
        level: "max20",
      },
    ],
  },
  {
    id: "ml",
    dimension: "机器学习与深度学习",
    question: "当团队讨论模型能力边界时，你通常能做到哪一步？",
    options: [
      { text: "A. 能听懂基础概念，知道模型不是万能的。", score: 1 },
      { text: "B. 能判断训练数据、模型能力和任务目标之间是否匹配。", score: 2 },
      { text: "C. 能把业务目标拆成模型能力、数据要求、评估口径和上线风险。", score: 3 },
    ],
  },
  {
    id: "rl",
    dimension: "强化学习",
    question: "面对需要持续优化策略的 AI 场景，你会怎么理解强化学习或反馈优化？",
    options: [
      { text: "A. 知道它和“根据反馈变好”有关，但主要依赖技术同学判断。", score: 1 },
      { text: "B. 能识别哪些场景需要奖励、反馈、探索和策略迭代。", score: 2 },
      { text: "C. 能和算法、产品一起定义反馈信号、优化目标、风险约束和长期收益。", score: 3 },
    ],
  },
  {
    id: "multimodal",
    dimension: "多模态",
    question: "当业务里同时涉及图文、视频、音频或结构化数据时，你会怎么设计 AI 方案？",
    options: [
      { text: "A. 能想到用多模态模型处理不同类型输入。", score: 1 },
      { text: "B. 能拆清楚每种模态的输入质量、输出形式和校验方式。", score: 2 },
      { text: "C. 能设计跨模态的信息流、评估标准、异常处理和业务闭环。", score: 3 },
    ],
  },
  {
    id: "harness",
    dimension: "Agent Harness",
    question: "设计 Agent 或自动化工作流时，你最能把握什么？",
    options: [
      { text: "A. 能描述希望 Agent 完成哪些步骤。", score: 1 },
      { text: "B. 能设计工具调用、状态流转、人机确认和失败兜底。", score: 2 },
      { text: "C. 能把 Agent Harness 设计成可观测、可回滚、可扩展的业务执行系统。", score: 3 },
    ],
  },
  {
    id: "memory",
    dimension: "上下文记忆管理",
    question: "当 AI 需要理解历史信息、用户偏好或业务上下文时，你会怎么处理？",
    options: [
      { text: "A. 会把必要背景整理进提示词或文档里。", score: 1 },
      { text: "B. 能区分短期上下文、长期记忆、知识库和权限边界。", score: 2 },
      { text: "C. 能设计上下文选择、记忆更新、隐私权限和效果评估机制。", score: 3 },
    ],
  },
  {
    id: "design",
    dimension: "AI 设计能力",
    question: "你如何判断一个 AI 产品体验是否设计得好？",
    options: [
      { text: "A. 看用户是否能顺利得到一个结果。", score: 1 },
      { text: "B. 看输入引导、结果解释、纠错反馈和用户掌控感是否完整。", score: 2 },
      { text: "C. 能从用户任务、信任建立、失败恢复和价值闭环设计完整 AI 体验。", score: 3 },
    ],
  },
  {
    id: "toolchain",
    dimension: "AI 工程化与工具链",
    question: "当 AI 能力要从 Demo 走向稳定复用时，你会优先补什么？",
    options: [
      { text: "A. 先把功能接进现有页面或流程，保证能用。", score: 1 },
      { text: "B. 补齐日志、监控、评测、配置和版本管理。", score: 2 },
      { text: "C. 建立可复用工具链、工程规范、自动评测和持续迭代机制。", score: 3 },
    ],
  },
];

const personaParts = {
  base: {
    pro: {
      name: "识图者",
      strength: "能听懂常见 AI 概念，并能大致判断大模型、Prompt、RAG、Agent 分别解决什么问题。",
      gap: "练习独立判断技术方案，而不是主要依赖算法或工程同学给答案。",
    },
    max5: {
      name: "选型者",
      strength: "能根据具体业务场景判断该用 Prompt、RAG、微调、Agent 还是普通规则。",
      gap: "把单点方案判断升级成阶段性技术路线，而不是只解决眼前需求。",
    },
    max20: {
      name: "领航者",
      strength: "能提前判断 AI 技术趋势会怎样影响业务，并帮助团队选择值得投入的方向。",
      gap: "持续用真实业务数据校准判断，避免只基于技术趋势做决策。",
    },
  },
  guard: {
    pro: {
      name: "守门员",
      strength: "知道 AI 功能上线前不能只看 Demo，还要关注效果、风险和基础兜底。",
      gap: "补齐评测集、bad case 回流、灰度、降级和成本监控这些上线动作。",
    },
    max5: {
      name: "操盘手",
      strength: "能为具体 AI 功能设计评测指标、上线方案、回退策略和风险控制。",
      gap: "把每次上线经验沉淀成团队可复用的准入标准和检查清单。",
    },
    max20: {
      name: "体系官",
      strength: "能把 Eval、工程化、安全、成本和线上反馈串成一套持续运行的保障体系。",
      gap: "保持对一线用户反馈的敏感度，避免体系只服务流程、不服务体验。",
    },
  },
  efficiency: {
    pro: {
      name: "提效者",
      strength: "能用 AI 辅助写作、总结、分析或生成内容，明显提升自己的工作效率。",
      gap: "把个人用法整理成模板或流程，让同组同学也能稳定复用。",
    },
    max5: {
      name: "流程师",
      strength: "能把多个 AI 工具串成团队工作流，处理周报、分析、创意或运营等高频任务。",
      gap: "用节省时间、输出质量和使用频率证明这套流程真的值得推广。",
    },
    max20: {
      name: "重构者",
      strength: "能重新设计团队工作方式，让 AI 进入跨角色、跨环节的真实业务流程。",
      gap: "持续验证业务收益，避免把流程改造做成形式上的 AI 化。",
    },
  },
  core: {
    pro: {
      name: "参与型 DRI",
      strength: "能理解核心 AI 能力模块，并在产品、算法、工程讨论中提出基本判断。",
      gap: "练习独立写出 AI 方案，包括输入输出、能力边界、评估方式和兜底逻辑。",
    },
    max5: {
      name: "主导型 DRI",
      strength: "能围绕具体业务问题主导 AI 方案设计，并推动产品、算法、工程一起落地。",
      gap: "把单个项目经验抽象成方法论，让类似场景可以更快复用。",
    },
    max20: {
      name: "架构型 DRI",
      strength: "能从业务目标反推完整 AI 能力组合，设计从问题定义到价值闭环的端到端架构。",
      gap: "持续关注用户价值和业务结果，避免方案技术完整但业务收益不足。",
    },
  },
};
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
let quizTouchStartX = 0;
let quizTouchStartY = 0;

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
  const isComplete = answers.every((answer) => answer !== null);
  document.getElementById("quizCount").textContent = `第 ${currentQuestion + 1} / ${quizQuestions.length} 题`;
  document.getElementById("quizQuestion").textContent = item.question;
  renderQuizPreviewCards();
  if (resultCard && !isComplete) {
    resultCard.hidden = true;
    resultCard.classList.remove("is-visible");
  }

  const optionContainer = document.getElementById("quizOptions");
  optionContainer.innerHTML = "";
  item.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option${answers[currentQuestion] === optionIndex ? " selected" : ""}`;
    button.textContent = typeof option === "string" ? option : option.text;
    button.dataset.level = String(optionIndex + 1);
    button.addEventListener("click", () => selectAnswer(optionIndex));
    optionContainer.append(button);
  });

  renderDots();
}

function renderQuizPreviewCards() {
  const previousIndex = (currentQuestion - 1 + quizQuestions.length) % quizQuestions.length;
  const nextIndex = (currentQuestion + 1) % quizQuestions.length;
  [
    [document.querySelector(".quiz-card.ghost.left"), previousIndex],
    [document.querySelector(".quiz-card.ghost.right"), nextIndex],
  ].forEach(([card, index]) => {
    if (!card) return;
    const count = card.querySelector("p");
    const title = card.querySelector("h3");
    if (count) count.textContent = `第 ${index + 1} / ${quizQuestions.length} 题`;
    if (title) title.textContent = quizQuestions[index].question;
  });
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

function coreLevelForScore(score) {
  if (score <= 11) return "pro";
  if (score <= 16) return "max5";
  return "max20";
}

function buildAitiResult() {
  const base = quizQuestions[0].options[answers[0]]?.level || "pro";
  const guard = quizQuestions[1].options[answers[1]]?.level || "pro";
  const efficiency = quizQuestions[2].options[answers[2]]?.level || "pro";
  const coreScore = answers.slice(3).reduce((sum, answerIndex, index) => {
    return sum + (quizQuestions[index + 3].options[answerIndex]?.score || 0);
  }, 0);
  const core = coreLevelForScore(coreScore);
  const parts = [
    personaParts.base[base],
    personaParts.guard[guard],
    personaParts.efficiency[efficiency],
    personaParts.core[core],
  ];
  const name = parts.map((part) => part.name).join(" × ");
  const strengths = parts.map((part) => part.strength);
  const gaps = parts.map((part) => part.gap);
  return {
    name,
    coreScore,
    strengths,
    gaps,
    labels: parts.map((part) => part.name),
  };
}

function resultCopyMarkup(result) {
  return `
    <span class="result-score">核心能力得分：${result.coreScore} / 21</span>
    <span class="result-summary">一句话结论：你当前的 AITI 人格由 ${result.labels.join("、")} 组成，适合从自身长板切入，继续补齐短板并形成可复用的 AI DRI 方法。</span>
    <strong>长板</strong>
    <ul>${result.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
    <strong>短板</strong>
    <ul>${result.gaps.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
}

function showResult({ scroll = true } = {}) {
  if (!resultCard) return;
  const result = buildAitiResult();
  document.getElementById("resultLevel").textContent = result.name;
  document.getElementById("resultCopy").innerHTML = resultCopyMarkup(result);
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
  captureActiveConceptDetail();
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

function hasConceptTabs() {
  return !!document.querySelector("[data-concept]");
}

function activeConceptKey() {
  return document.querySelector("[data-concept].active")?.dataset.concept || "";
}

function conceptText(id) {
  return document.getElementById(id)?.textContent.trim() || "";
}

function readConceptDetailFromDom() {
  if (!document.getElementById("conceptTitle")) return null;
  return {
    title: conceptText("conceptTitle"),
    intro: conceptText("conceptIntro"),
    points: [
      [
        conceptText("conceptIconOne"),
        conceptText("conceptPointTitleOne"),
        conceptText("conceptPointTextOne"),
      ],
      [
        conceptText("conceptIconTwo"),
        conceptText("conceptPointTitleTwo"),
        conceptText("conceptPointTextTwo"),
      ],
      [
        conceptText("conceptIconThree"),
        conceptText("conceptPointTitleThree"),
        conceptText("conceptPointTextThree"),
      ],
    ],
  };
}

function normalizeConceptDetail(detail, fallback) {
  if (!detail || typeof detail !== "object") return fallback;
  const points = Array.isArray(detail.points) ? detail.points : fallback.points;
  return {
    title: String(detail.title ?? fallback.title ?? ""),
    intro: String(detail.intro ?? fallback.intro ?? ""),
    points: [0, 1, 2].map((index) => {
      const point = Array.isArray(points[index]) ? points[index] : fallback.points[index];
      const fallbackPoint = fallback.points[index] || ["", "", ""];
      return [0, 1, 2].map((pointIndex) =>
        String(point?.[pointIndex] ?? fallbackPoint[pointIndex] ?? ""),
      );
    }),
  };
}

function captureActiveConceptDetail() {
  const key = activeConceptKey();
  if (!key || !conceptDetails[key]) return;
  const currentDetail = readConceptDetailFromDom();
  if (!currentDetail) return;
  conceptDetails[key] = normalizeConceptDetail(currentDetail, conceptDetails[key]);
}

function serializableConceptDetails() {
  if (!hasConceptTabs()) return null;
  captureActiveConceptDetail();
  return Object.fromEntries(
    Object.entries(conceptDetails).map(([key, detail]) => [
      key,
      normalizeConceptDetail(detail, conceptDetails[key]),
    ]),
  );
}

function applyConceptDetailsState(details) {
  if (!details || typeof details !== "object") return;
  Object.entries(details).forEach(([key, detail]) => {
    if (!conceptDetails[key]) return;
    conceptDetails[key] = normalizeConceptDetail(detail, conceptDetails[key]);
  });
}

function pageState() {
  const savedConceptDetails = serializableConceptDetails();
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
    conceptDetails: savedConceptDetails || undefined,
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
    cache: "no-store",
  });
  if (response.status === 404) {
    return { sha: null, state: { version: 1, pages: {}, navLabels: defaultNavLabels } };
  }
  if (!response.ok) {
    throw new Error(`无法读取 GitHub 云端状态（${response.status}）`);
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
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let detail = "";
    try {
      const errorBody = await response.json();
      detail = errorBody.message ? `：${errorBody.message}` : "";
    } catch {
      detail = "";
    }
    throw new Error(`云端保存失败（${response.status}）${detail}`);
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
  applyConceptDetailsState(state.conceptDetails);
  captureActiveConceptDetail();
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

  document.addEventListener(
    "touchstart",
    (event) => {
      if (!event.target.closest(".quiz-stage")) return;
      const touch = event.touches[0];
      quizTouchStartX = touch.clientX;
      quizTouchStartY = touch.clientY;
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    (event) => {
      if (!event.target.closest(".quiz-stage")) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - quizTouchStartX;
      const deltaY = touch.clientY - quizTouchStartY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
      currentQuestion =
        deltaX < 0
          ? (currentQuestion + 1) % quizQuestions.length
          : (currentQuestion - 1 + quizQuestions.length) % quizQuestions.length;
      renderQuiz();
    },
    { passive: true },
  );

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
