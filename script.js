const STORAGE_KEY = "ai-dri-guide-page-state";
const STATE_VERSION = 2;

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
  ".modal-backdrop",
  ".popover",
  ".upload-chip",
  ".play",
  ".round-nav",
  ".quiz-dots",
  ".tag-popover",
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

let editing = false;
let currentQuestion = 0;
const answers = new Array(quizQuestions.length).fill(null);

const toggleEditButton = document.getElementById("toggleEdit");
const saveButton = document.getElementById("savePage");
const exportButton = document.getElementById("exportHtml");
const saveStatus = document.getElementById("saveStatus");
const resultModal = document.getElementById("resultModal");
const closeModalButton = document.getElementById("closeModal");
const reviewResultButton = document.getElementById("reviewResult");
const popover = document.getElementById("definitionPopover");

function editableElements() {
  return [...document.querySelectorAll(`.editable-scope ${editableSelector}`)].filter(
    (element) => !element.closest(nonEditableSelector),
  );
}

function setEditing(nextValue) {
  editing = nextValue;
  document.body.classList.toggle("editing", editing);
  toggleEditButton.firstChild.textContent = editing ? "退出编辑" : "编辑模式";
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
        saveState("图片已更新");
      };
      reader.readAsDataURL(file);
    });

    host.append(input, button);
  });
}

function renderQuiz() {
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

function showResult() {
  const score = answers.reduce((sum, value) => sum + value + 1, 0);
  const level = score <= 10 ? "入门型 AI DRI" : score <= 16 ? "进阶型 AI DRI" : "精通型 AI DRI";
  document.getElementById("resultLevel").textContent = level;
  resultModal.hidden = false;
}

function closeResult() {
  resultModal.hidden = true;
}

function showPopover(key, anchor) {
  const content = popoverContent[key];
  if (!content) return;
  document.getElementById("popoverTitle").textContent = content.title;
  document.getElementById("popoverText").textContent = content.text;
  popover.hidden = false;

  const rect = anchor.getBoundingClientRect();
  const top = Math.min(window.innerHeight - 190, Math.max(96, rect.top - 30));
  popover.style.top = `${top}px`;
  popover.style.right = `${Math.max(24, window.innerWidth - rect.left + 18)}px`;
}

function closePopover() {
  popover.hidden = true;
}

function pageState() {
  const scopeClone = document.querySelector(".editable-scope").cloneNode(true);
  scopeClone.querySelectorAll(".upload-chip, input[data-upload-for]").forEach((element) => {
    element.remove();
  });
  return {
    version: STATE_VERSION,
    html: scopeClone.innerHTML,
    answers,
    currentQuestion,
  };
}

function saveState(message = "已保存") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pageState()));
  saveStatus.textContent = message;
  window.setTimeout(() => {
    saveStatus.textContent = "";
  }, 1800);
}

function restoreState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    if (state.version !== STATE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
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
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
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
  clone.querySelectorAll("[data-future-page]").forEach((element) => {
    element.setAttribute("href", element.getAttribute("data-future-page") || "#");
  });
  clone.querySelectorAll(".save-status").forEach((element) => {
    element.textContent = "";
  });
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
  saveStatus.textContent = "已导出";
  window.setTimeout(() => {
    saveStatus.textContent = "";
  }, 1800);
}

function bindEvents() {
  toggleEditButton.addEventListener("click", () => setEditing(!editing));
  saveButton.addEventListener("click", () => saveState());
  exportButton.addEventListener("click", exportHtml);

  document.getElementById("prevQuestion").addEventListener("click", () => {
    currentQuestion = (currentQuestion - 1 + quizQuestions.length) % quizQuestions.length;
    renderQuiz();
  });

  document.getElementById("nextQuestion").addEventListener("click", () => {
    currentQuestion = (currentQuestion + 1) % quizQuestions.length;
    renderQuiz();
  });

  closeModalButton.addEventListener("click", closeResult);
  reviewResultButton.addEventListener("click", closeResult);
  resultModal.addEventListener("click", (event) => {
    if (event.target === resultModal) closeResult();
  });

  document.querySelectorAll(".tag-popover").forEach((button) => {
    button.addEventListener("mouseenter", () => showPopover(button.dataset.popover, button));
    button.addEventListener("focus", () => showPopover(button.dataset.popover, button));
    button.addEventListener("mouseleave", closePopover);
    button.addEventListener("blur", closePopover);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeResult();
      closePopover();
    }
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link?.dataset.futurePage) {
      event.preventDefault();
      saveStatus.textContent = "子页面待建设";
      window.setTimeout(() => {
        saveStatus.textContent = "";
      }, 1400);
      return;
    }
    if (editing && link && link.closest(".editable-scope")) {
      event.preventDefault();
    }
  });
}

restoreState();
installImageUploaders();
renderQuiz();
bindEvents();
