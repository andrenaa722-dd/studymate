/* =========================================================
   STUDYMATE
   Main JavaScript
   AI Study Workspace
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initStudyMate();
});

/* =========================================================
   CONFIGURATION
   ========================================================= */

const STUDYMATE_BACKEND = "http://localhost:3000";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const StudyMate = {
    user: {
        email: localStorage.getItem("studymate_email") || "",
        role: localStorage.getItem("studymate_role") || ""
    },

    timer: {
        mode: "focus",
        duration: 25 * 60,
        remaining: 25 * 60,
        running: false,
        interval: null
    },

    quiz: {
        questions: [],
        current: 0,
        score: 0
    },

    notes: {
        currentText: ""
    },

    tasks: JSON.parse(
        localStorage.getItem("studymate_tasks") || "[]"
    ),

    library: JSON.parse(
        localStorage.getItem("studymate_library") || "[]"
    ),

    chat: {
        messages: []
    }
};

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initStudyMate() {
    setupOnboarding();
    setupNavigation();
    setupSearch();

    setupChat();
    setupTimer();
    setupPlanner();
    setupNotes();
    setupQuiz();
    setupLibrary();

    setupDocumentStudio();

    setupQuickActions();
    setupCommandPalette();

    updateUserInterface();
    updateDashboard();

    renderTasks();
    renderLibrary();
    updateTimerDisplay();

    if (StudyMate.user.email && StudyMate.user.role) {
        hideOnboarding();
    } else {
        showOnboarding();
    }
}

/* =========================================================
   ONBOARDING / LOGIN
   ========================================================= */

function setupOnboarding() {
    const emailInput = document.querySelector("#emailInput");
    const continueBtn = document.querySelector("#continueBtn");

    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            const email = emailInput
                ? emailInput.value.trim()
                : "";

            if (!email) {
                showToast("Please enter your email.");
                return;
            }

            if (!isValidEmail(email)) {
                showToast("Please enter a valid email.");
                return;
            }

            StudyMate.user.email = email;

            localStorage.setItem(
                "studymate_email",
                email
            );

            showRoleSelection();
        });
    }

    document.querySelectorAll("[data-role]").forEach(button => {
        button.addEventListener("click", () => {
            const role = button.dataset.role;

            if (!role) return;

            StudyMate.user.role = role;

            localStorage.setItem(
                "studymate_role",
                role
            );

            hideOnboarding();

            updateUserInterface();
            updateDashboard();

            showToast(
                `Welcome to StudyMate, ${formatRole(role)}!`
            );
        });
    });

    const logoutBtn = document.querySelector("#logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}

function showOnboarding() {
    const onboarding =
        document.querySelector("#onboarding");

    if (onboarding) {
        onboarding.classList.remove("hidden");
    }

    document.body.classList.add(
        "onboarding-active"
    );
}

function hideOnboarding() {
    const onboarding =
        document.querySelector("#onboarding");

    if (onboarding) {
        onboarding.classList.add("hidden");
    }

    document.body.classList.remove(
        "onboarding-active"
    );
}

function showRoleSelection() {
    const emailStep =
        document.querySelector("#emailStep");

    const roleStep =
        document.querySelector("#roleStep");

    if (emailStep) {
        emailStep.classList.add("hidden");
    }

    if (roleStep) {
        roleStep.classList.remove("hidden");
    }
}

function logout() {
    localStorage.removeItem(
        "studymate_email"
    );

    localStorage.removeItem(
        "studymate_role"
    );

    StudyMate.user.email = "";
    StudyMate.user.role = "";

    const emailStep =
        document.querySelector("#emailStep");

    const roleStep =
        document.querySelector("#roleStep");

    if (emailStep) {
        emailStep.classList.remove("hidden");
    }

    if (roleStep) {
        roleStep.classList.add("hidden");
    }

    const emailInput =
        document.querySelector("#emailInput");

    if (emailInput) {
        emailInput.value = "";
    }

    showOnboarding();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
}

/* =========================================================
   USER INTERFACE
   ========================================================= */

function updateUserInterface() {
    const email = StudyMate.user.email;
    const role = StudyMate.user.role;

    document
        .querySelectorAll("[data-user-email]")
        .forEach(element => {
            element.textContent =
                email || "StudyMate User";
        });

    document
        .querySelectorAll("[data-user-role]")
        .forEach(element => {
            element.textContent =
                formatRole(role || "student");
        });

    document
        .querySelectorAll("[data-role-dashboard]")
        .forEach(element => {
            element.textContent =
                getRoleDashboardTitle(role);
        });

    updateRoleFacilities();
}

function formatRole(role) {
    if (!role) {
        return "Student";
    }

    return (
        role.charAt(0).toUpperCase() +
        role.slice(1)
    );
}

function getRoleDashboardTitle(role) {
    switch (role) {
        case "teacher":
            return "Teaching Workspace";

        case "researcher":
            return "Research Workspace";

        default:
            return "Student Workspace";
    }
}

/* =========================================================
   ROLE BASED FACILITIES
   ========================================================= */

function updateRoleFacilities() {
    const role =
        StudyMate.user.role || "student";

    const studentTools = [
        "AI Tutor",
        "Smart Notes",
        "Quizzes",
        "Study Planner",
        "Focus Timer",
        "Document Studio"
    ];

    const teacherTools = [
        "AI Tutor",
        "Lesson Planner",
        "Quiz Generator",
        "Teaching Materials",
        "Class Planner",
        "Document Studio"
    ];

    const researcherTools = [
        "Research Assistant",
        "Paper Summaries",
        "Compare Papers",
        "Research Planner",
        "Data Workspace",
        "Document Studio"
    ];

    let tools = studentTools;

    if (role === "teacher") {
        tools = teacherTools;
    }

    if (role === "researcher") {
        tools = researcherTools;
    }

    document
        .querySelectorAll("[data-role-tools]")
        .forEach(container => {
            container.innerHTML = "";

            tools.forEach(tool => {
                const item =
                    document.createElement("div");

                item.className = "role-tool";
                item.textContent = tool;

                container.appendChild(item);
            });
        });
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
    document
        .querySelectorAll("[data-view]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const view =
                    button.dataset.view;

                if (!view) return;

                showView(view);

                document
                    .querySelectorAll("[data-view]")
                    .forEach(item => {
                        item.classList.remove(
                            "active"
                        );
                    });

                button.classList.add("active");

                closeMobileSidebar();
            });
        });
}

function showView(viewName) {
    document
        .querySelectorAll(".view")
        .forEach(view => {
            view.classList.remove("active");
        });

    const target =
        document.querySelector(
            `#${viewName}`
        );

    if (target) {
        target.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function closeMobileSidebar() {
    document.body.classList.remove(
        "sidebar-open"
    );
}

/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {
    const searchInput =
        document.querySelector("#globalSearch");

    if (!searchInput) return;

    searchInput.addEventListener(
        "input",
        () => {
            const query =
                searchInput.value
                    .toLowerCase()
                    .trim();

            document
                .querySelectorAll(
                    "[data-searchable]"
                )
                .forEach(item => {
                    const text =
                        item.textContent
                            .toLowerCase();

                    item.style.display =
                        !query ||
                        text.includes(query)
                            ? ""
                            : "none";
                });
        }
    );
}

/* =========================================================
   AI TUTOR
   ========================================================= */

function setupChat() {
    const form =
        document.querySelector("#chatForm");

    const input =
        document.querySelector("#chatInput");

    if (form && input) {
        form.addEventListener(
            "submit",
            async event => {
                event.preventDefault();

                const message =
                    input.value.trim();

                if (!message) return;

                addUserMessage(message);

                input.value = "";

                await askStudyMateAI(message);
            }
        );
    }

    document
        .querySelectorAll("[data-prompt]")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const prompt =
                        button.dataset.prompt;

                    if (input) {
                        input.value = prompt;
                        input.focus();
                    }
                }
            );
        });
}

/* =========================================================
   ASK AI AGENT
   ========================================================= */

async function askStudyMateAI(message) {
    const typing =
        addTypingMessage();

    try {
        const response =
            await fetch(
                `${STUDYMATE_BACKEND}/api/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message,

                        role:
                            StudyMate.user.role ||
                            "student",

                        email:
                            StudyMate.user.email || "",

                        history:
                            StudyMate.chat.messages
                    })
                }
            );

        removeTypingMessage(typing);

        if (!response.ok) {
            throw new Error(
                "AI backend unavailable"
            );
        }

        const data =
            await response.json();

        const reply =
            data.message ||
            data.reply ||
            data.response;

        if (!reply) {
            throw new Error(
                "AI returned no response"
            );
        }

        StudyMate.chat.messages.push({
            role: "user",
            content: message
        });

        StudyMate.chat.messages.push({
            role: "assistant",
            content: reply
        });

        addAssistantMessage(reply);

    } catch (error) {
        console.warn(
            "AI Tutor backend error:",
            error
        );

        removeTypingMessage(typing);

        const fallback =
            generateTutorResponse(message);

        StudyMate.chat.messages.push({
            role: "user",
            content: message
        });

        StudyMate.chat.messages.push({
            role: "assistant",
            content: fallback
        });

        addAssistantMessage(fallback);
    }
}

/* =========================================================
   CHAT UI
   ========================================================= */

function addUserMessage(message) {
    const chatMessages =
        document.querySelector(
            "#chatMessages"
        );

    if (!chatMessages) return;

    const messageElement =
        document.createElement("div");

    messageElement.className =
        "message user-message";

    messageElement.innerHTML = `
        <div class="message-content">
            ${escapeHTML(message)}
        </div>
    `;

    chatMessages.appendChild(
        messageElement
    );

    scrollChatToBottom();
}

function addAssistantMessage(message) {
    const chatMessages =
        document.querySelector(
            "#chatMessages"
        );

    if (!chatMessages) return;

    const messageElement =
        document.createElement("div");

    messageElement.className =
        "message assistant-message";

    messageElement.innerHTML = `
        <div class="message-avatar">✦</div>

        <div class="message-content">
            ${formatText(message)}
        </div>
    `;

    chatMessages.appendChild(
        messageElement
    );

    scrollChatToBottom();
}

function addTypingMessage() {
    const chatMessages =
        document.querySelector(
            "#chatMessages"
        );

    if (!chatMessages) {
        return null;
    }

    const element =
        document.createElement("div");

    element.className =
        "message assistant-message studymate-typing";

    element.innerHTML = `
        <div class="message-avatar">✦</div>

        <div class="message-content">
            <span>StudyMate AI is thinking...</span>
        </div>
    `;

    chatMessages.appendChild(element);

    scrollChatToBottom();

    return element;
}

function removeTypingMessage(element) {
    if (element && element.remove) {
        element.remove();
    }
}

function scrollChatToBottom() {
    const chatMessages =
        document.querySelector(
            "#chatMessages"
        );

    if (!chatMessages) return;

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}

/* =========================================================
   LOCAL AI FALLBACK
   ========================================================= */

function generateTutorResponse(message) {
    const text =
        message.toLowerCase();

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {
        return `
            <strong>Hey! 👋</strong><br><br>
            I'm your StudyMate AI Tutor.
            What would you like to learn today?
        `;
    }

    if (text.includes("sql")) {
        return `
            <strong>SQL in simple words:</strong><br><br>

            SQL is used to communicate
            with databases.<br><br>

            <strong>DDL:</strong>
            CREATE, ALTER, DROP, TRUNCATE<br>

            <strong>DML:</strong>
            INSERT, UPDATE, DELETE<br>

            <strong>DQL:</strong>
            SELECT<br><br>

            Think of a database as a digital
            cupboard and SQL as the language
            you use to organize and retrieve
            what's inside.
        `;
    }

    if (text.includes("stack")) {
        return `
            A <strong>Stack</strong> follows
            <strong>LIFO</strong> —
            Last In, First Out.<br><br>

            Example: a stack of plates.
            The last plate placed on top
            is the first one removed.<br><br>

            <strong>Push</strong> — add an item<br>
            <strong>Pop</strong> — remove an item<br>
            <strong>Peek</strong> — view the top item
        `;
    }

    if (text.includes("python")) {
        return `
            <strong>Python</strong> is a
            high-level programming language
            known for readable syntax.<br><br>

            Example:<br><br>

            <code>print("Hello, StudyMate!")</code>
        `;
    }

    if (
        text.includes("merge sort") ||
        text.includes("quick sort")
    ) {
        return `
            I can explain sorting algorithms
            step by step.<br><br>

            For an exam, remember:<br><br>

            <strong>Merge Sort</strong> →
            Divide and conquer + merging<br>

            <strong>Quick Sort</strong> →
            Choose pivot + partition<br><br>

            Ask me for the algorithm,
            example, complexity, or exam
            answer format.
        `;
    }

    if (
        text.includes("exam") ||
        text.includes("study")
    ) {
        return `
            Let's turn that into a study plan 📚<br><br>

            1. Understand the concept.<br>
            2. Write a short summary.<br>
            3. Solve 3–5 questions.<br>
            4. Take a short break.<br>
            5. Test yourself without looking
               at your notes.
        `;
    }

    return `
        <strong>I'm ready to help you learn! 🧠</strong><br><br>

        Ask me to:<br>

        • Explain a concept<br>
        • Prepare exam notes<br>
        • Create examples<br>
        • Explain code<br>
        • Create revision questions<br>
        • Compare concepts<br>
        • Make a study plan<br><br>

        Try:
        <em>"Explain merge sort in simple words."</em>
    `;
}

/* =========================================================
   SMART NOTES
   ========================================================= */

function setupNotes() {
    const summarizeBtn =
        document.querySelector(
            "#summarizeBtn"
        );

    const notesInput =
        document.querySelector(
            "#notesInput"
        );

    if (summarizeBtn && notesInput) {
        summarizeBtn.addEventListener(
            "click",
            () => {
                const text =
                    notesInput.value.trim();

                if (!text) {
                    showToast(
                        "Add some text first."
                    );

                    return;
                }

                const summary =
                    createSummary(text);

                StudyMate.notes.currentText =
                    summary;

                const output =
                    document.querySelector(
                        "#notesOutput"
                    );

                if (output) {
                    output.innerHTML =
                        formatText(summary);
                }

                showToast(
                    "Summary created!"
                );
            }
        );
    }

    const copyBtn =
        document.querySelector(
            "#copyNotesBtn"
        );

    if (copyBtn) {
        copyBtn.addEventListener(
            "click",
            async () => {
                const output =
                    document.querySelector(
                        "#notesOutput"
                    );

                if (!output) return;

                try {
                    await navigator
                        .clipboard
                        .writeText(
                            output.innerText
                        );

                    showToast(
                        "Notes copied!"
                    );

                } catch {
                    showToast(
                        "Unable to copy notes."
                    );
                }
            }
        );
    }
}

function createSummary(text) {
    const sentences =
        text
            .replace(/\s+/g, " ")
            .split(/[.!?]+/)
            .map(
                sentence =>
                    sentence.trim()
            )
            .filter(Boolean);

    if (sentences.length <= 3) {
        return `
### Quick Summary

${sentences
    .map(s => `• ${s}`)
    .join("\n")}
        `.trim();
    }

    const important =
        sentences.slice(
            0,
            Math.max(
                3,
                Math.ceil(
                    sentences.length * 0.4
                )
            )
        );

    return `
### Quick Summary

${important
    .map(
        sentence => `• ${sentence}`
    )
    .join("\n")}

### Key Points

• Focus on the main definitions and concepts.
• Identify important examples.
• Review relationships between concepts.
• Test yourself after studying.
    `.trim();
}

/* =========================================================
   QUIZ GENERATOR
   ========================================================= */

function setupQuiz() {
    const generateQuizBtn =
        document.querySelector(
            "#generateQuizBtn"
        );

    if (generateQuizBtn) {
        generateQuizBtn.addEventListener(
            "click",
            () => {
                const topicInput =
                    document.querySelector(
                        "#quizTopic"
                    );

                const topic =
                    topicInput
                        ? topicInput.value.trim()
                        : "";

                if (!topic) {
                    showToast(
                        "Enter a topic first."
                    );

                    return;
                }

                StudyMate.quiz.questions =
                    generateQuizQuestions(
                        topic
                    );

                StudyMate.quiz.current = 0;
                StudyMate.quiz.score = 0;

                renderQuiz();

                showToast(
                    "Quiz generated!"
                );
            }
        );
    }
}

function generateQuizQuestions(topic) {
    return [
        {
            question:
                `What is the main purpose of studying ${topic}?`,

            options: [
                "To understand and apply its concepts",
                "To avoid learning anything",
                "To memorize random words",
                "None of the above"
            ],

            answer: 0,

            explanation:
                `The main goal is to understand the concepts of ${topic} and apply them correctly.`
        },

        {
            question:
                `Which approach is generally best when learning ${topic}?`,

            options: [
                "Understand the fundamentals first",
                "Skip the basics",
                "Only memorize definitions",
                "Never practice"
            ],

            answer: 0,

            explanation:
                "Strong fundamentals make advanced concepts much easier to understand."
        },

        {
            question:
                `Which technique can improve your understanding of ${topic}?`,

            options: [
                "Active recall and practice",
                "Ignoring mistakes",
                "Studying without breaks",
                "Avoiding questions"
            ],

            answer: 0,

            explanation:
                "Active recall and practice help strengthen understanding and memory."
        }
    ];
}

function renderQuiz() {
    const container =
        document.querySelector(
            "#quizContainer"
        );

    if (!container) return;

    const questions =
        StudyMate.quiz.questions;

    if (!questions.length) {
        container.innerHTML = `
            <div class="empty-state">
                Generate a quiz to begin.
            </div>
        `;

        return;
    }

    const current =
        questions[
            StudyMate.quiz.current
        ];

    container.innerHTML = `
        <div class="quiz-question">

            <div class="quiz-progress">
                Question
                ${StudyMate.quiz.current + 1}
                of
                ${questions.length}
            </div>

            <h3>
                ${escapeHTML(current.question)}
            </h3>

            <div class="quiz-options">

                ${current.options
                    .map(
                        (option, index) => `
                            <button
                                class="quiz-option"
                                data-option="${index}">
                                ${escapeHTML(option)}
                            </button>
                        `
                    )
                    .join("")}

            </div>

        </div>
    `;

    container
        .querySelectorAll(
            ".quiz-option"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    answerQuiz(
                        Number(
                            button.dataset.option
                        )
                    );
                }
            );
        });
}

function answerQuiz(selected) {
    const question =
        StudyMate.quiz.questions[
            StudyMate.quiz.current
        ];

    const buttons =
        document.querySelectorAll(
            ".quiz-option"
        );

    buttons.forEach(button => {
        button.disabled = true;

        const index =
            Number(
                button.dataset.option
            );

        if (
            index === question.answer
        ) {
            button.classList.add(
                "correct"
            );
        }

        if (
            index === selected &&
            selected !== question.answer
        ) {
            button.classList.add(
                "incorrect"
            );
        }
    });

    if (
        selected === question.answer
    ) {
        StudyMate.quiz.score++;
    }

    setTimeout(() => {
        StudyMate.quiz.current++;

        if (
            StudyMate.quiz.current >=
            StudyMate.quiz.questions.length
        ) {
            showQuizResult();
        } else {
            renderQuiz();
        }
    }, 900);
}

function showQuizResult() {
    const container =
        document.querySelector(
            "#quizContainer"
        );

    if (!container) return;

    const total =
        StudyMate.quiz.questions.length;

    const score =
        StudyMate.quiz.score;

    const percentage =
        Math.round(
            (score / total) * 100
        );

    container.innerHTML = `
        <div class="quiz-result">

            <div class="result-icon">
                🎉
            </div>

            <h2>
                Quiz Complete!
            </h2>

            <div class="result-score">
                ${score} / ${total}
            </div>

            <p>
                You scored ${percentage}%.
            </p>

            <button
                class="primary-btn"
                id="restartQuizBtn">
                Try Again
            </button>

        </div>
    `;

    document
        .querySelector(
            "#restartQuizBtn"
        )
        ?.addEventListener(
            "click",
            () => {
                StudyMate.quiz.current = 0;
                StudyMate.quiz.score = 0;

                renderQuiz();
            }
        );
}

/* =========================================================
   STUDY PLANNER
   ========================================================= */

function setupPlanner() {
    const taskForm =
        document.querySelector(
            "#taskForm"
        );

    if (!taskForm) return;

    taskForm.addEventListener(
        "submit",
        event => {
            event.preventDefault();

            const titleInput =
                document.querySelector(
                    "#taskTitle"
                );

            const subjectInput =
                document.querySelector(
                    "#taskSubject"
                );

            const title =
                titleInput
                    ? titleInput.value.trim()
                    : "";

            const subject =
                subjectInput
                    ? subjectInput.value.trim()
                    : "";

            if (!title) {
                showToast(
                    "Enter a task."
                );

                return;
            }

            const task = {
                id: Date.now(),

                title,

                subject:
                    subject || "General",

                completed: false,

                created:
                    new Date().toISOString()
            };

            StudyMate.tasks.push(task);

            saveTasks();

            renderTasks();

            updateDashboard();

            taskForm.reset();

            showToast(
                "Task added!"
            );
        }
    );
}

function saveTasks() {
    localStorage.setItem(
        "studymate_tasks",
        JSON.stringify(
            StudyMate.tasks
        )
    );
}

function renderTasks() {
    const container =
        document.querySelector(
            "#taskList"
        );

    if (!container) return;

    if (!StudyMate.tasks.length) {
        container.innerHTML = `
            <div class="empty-state">
                No study tasks yet.
                Add one above.
            </div>
        `;

        return;
    }

    container.innerHTML =
        StudyMate.tasks
            .map(
                task => `
                    <div
                        class="task-item ${
                            task.completed
                                ? "completed"
                                : ""
                        }"
                        data-task-id="${task.id}"
                    >

                        <label class="task-check">
                            <input
                                type="checkbox"
                                data-task-toggle="${task.id}"
                                ${
                                    task.completed
                                        ? "checked"
                                        : ""
                                }
                            >

                            <span></span>
                        </label>

                        <div class="task-info">

                            <div class="task-title">
                                ${escapeHTML(task.title)}
                            </div>

                            <div class="task-subject">
                                ${escapeHTML(task.subject)}
                            </div>

                        </div>

                        <button
                            type="button"
                            class="task-delete"
                            data-task-delete="${task.id}"
                            aria-label="Delete task">
                            ×
                        </button>

                    </div>
                `
            )
            .join("");

    container
        .querySelectorAll(
            "[data-task-toggle]"
        )
        .forEach(input => {
            input.addEventListener(
                "change",
                () => {
                    const id =
                        Number(
                            input.dataset.taskToggle
                        );

                    const task =
                        StudyMate.tasks.find(
                            item =>
                                item.id === id
                        );

                    if (!task) return;

                    task.completed =
                        input.checked;

                    saveTasks();

                    renderTasks();

                    updateDashboard();
                }
            );
        });

    container
        .querySelectorAll(
            "[data-task-delete]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const id =
                        Number(
                            button.dataset.taskDelete
                        );

                    StudyMate.tasks =
                        StudyMate.tasks.filter(
                            task =>
                                task.id !== id
                        );

                    saveTasks();

                    renderTasks();

                    updateDashboard();

                    showToast(
                        "Task deleted."
                    );
                }
            );
        });
}

/* =========================================================
   FOCUS TIMER
   ========================================================= */

function setupTimer() {
    const startBtn =
        document.querySelector(
            "#timerStart"
        );

    const resetBtn =
        document.querySelector(
            "#timerReset"
        );

    const modeButtons =
        document.querySelectorAll(
            "[data-timer-mode]"
        );

    if (startBtn) {
        startBtn.addEventListener(
            "click",
            toggleTimer
        );
    }

    if (resetBtn) {
        resetBtn.addEventListener(
            "click",
            resetTimer
        );
    }

    modeButtons.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const mode =
                    button.dataset.timerMode;

                if (!mode) return;

                setTimerMode(mode);
            }
        );
    });
}

function setTimerMode(mode) {
    stopTimer();

    StudyMate.timer.mode = mode;

    if (mode === "short") {
        StudyMate.timer.duration =
            5 * 60;
    } else if (mode === "long") {
        StudyMate.timer.duration =
            15 * 60;
    } else {
        StudyMate.timer.duration =
            25 * 60;
    }

    StudyMate.timer.remaining =
        StudyMate.timer.duration;

    document
        .querySelectorAll(
            "[data-timer-mode]"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.timerMode === mode
            );
        });

    updateTimerDisplay();
}

function toggleTimer() {
    if (StudyMate.timer.running) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (StudyMate.timer.running) return;

    StudyMate.timer.running = true;

    updateTimerButton();

    StudyMate.timer.interval =
        setInterval(() => {
            if (
                StudyMate.timer.remaining <= 0
            ) {
                finishTimer();
                return;
            }

            StudyMate.timer.remaining--;

            updateTimerDisplay();
        }, 1000);
}

function stopTimer() {
    StudyMate.timer.running = false;

    if (StudyMate.timer.interval) {
        clearInterval(
            StudyMate.timer.interval
        );

        StudyMate.timer.interval = null;
    }

    updateTimerButton();
}

function resetTimer() {
    stopTimer();

    StudyMate.timer.remaining =
        StudyMate.timer.duration;

    updateTimerDisplay();
}

function finishTimer() {
    stopTimer();

    StudyMate.timer.remaining = 0;

    updateTimerDisplay();

    showToast(
        "Focus session complete! 🎉"
    );

    try {
        if (
            "Notification" in window &&
            Notification.permission ===
                "granted"
        ) {
            new Notification(
                "StudyMate",
                {
                    body:
                        "Your focus session is complete!"
                }
            );
        }
    } catch {}
}

function updateTimerDisplay() {
    const minutes =
        Math.floor(
            StudyMate.timer.remaining / 60
        );

    const seconds =
        StudyMate.timer.remaining % 60;

    const formatted =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    document
        .querySelectorAll(
            "[data-timer-display]"
        )
        .forEach(element => {
            element.textContent = formatted;
        });

    const timerText =
        document.querySelector(
            "#timerDisplay"
        );

    if (timerText) {
        timerText.textContent = formatted;
    }

    const progress =
        document.querySelector(
            "[data-timer-progress]"
        );

    if (progress) {
        const percentage =
            StudyMate.timer.duration
                ? (
                    StudyMate.timer.remaining /
                    StudyMate.timer.duration
                ) * 100
                : 0;

        progress.style.setProperty(
            "--timer-progress",
            `${percentage}%`
        );

        if (
            progress.tagName ===
            "PROGRESS"
        ) {
            progress.value =
                percentage;
        }
    }

    updateTimerButton();
}

function updateTimerButton() {
    const button =
        document.querySelector(
            "#timerStart"
        );

    if (!button) return;

    button.textContent =
        StudyMate.timer.running
            ? "Pause"
            : "Start";
}

/* =========================================================
   LIBRARY
   ========================================================= */

function setupLibrary() {
    const addLibraryBtn =
        document.querySelector(
            "#addLibraryBtn"
        );

    if (addLibraryBtn) {
        addLibraryBtn.addEventListener(
            "click",
            () => {
                const title =
                    window.prompt(
                        "Enter a resource title:"
                    );

                if (!title) return;

                const item = {
                    id: Date.now(),
                    title: title.trim(),
                    created:
                        new Date().toISOString()
                };

                StudyMate.library.push(
                    item
                );

                saveLibrary();

                renderLibrary();

                showToast(
                    "Resource added!"
                );
            }
        );
    }
}

function saveLibrary() {
    localStorage.setItem(
        "studymate_library",
        JSON.stringify(
            StudyMate.library
        )
    );
}

function renderLibrary() {
    const container =
        document.querySelector(
            "#libraryList"
        );

    if (!container) return;

    if (!StudyMate.library.length) {
        container.innerHTML = `
            <div class="empty-state">
                Your library is empty.
            </div>
        `;

        return;
    }

    container.innerHTML =
        StudyMate.library
            .map(
                item => `
                    <div
                        class="library-item"
                        data-library-id="${item.id}"
                    >

                        <div class="library-icon">
                            📚
                        </div>

                        <div class="library-info">
                            <strong>
                                ${escapeHTML(item.title)}
                            </strong>

                            <small>
                                Study resource
                            </small>
                        </div>

                        <button
                            type="button"
                            class="library-delete"
                            data-library-delete="${item.id}">
                            Delete
                        </button>

                    </div>
                `
            )
            .join("");

    container
        .querySelectorAll(
            "[data-library-delete]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const id =
                        Number(
                            button.dataset.libraryDelete
                        );

                    StudyMate.library =
                        StudyMate.library.filter(
                            item =>
                                item.id !== id
                        );

                    saveLibrary();

                    renderLibrary();

                    showToast(
                        "Resource removed."
                    );
                }
            );
        });
}

/* =========================================================
   DOCUMENT STUDIO
   ========================================================= */

function setupDocumentStudio() {
    document
        .querySelectorAll(
            "[data-create-document]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const type =
                        button.dataset
                            .createDocument;

                    createDocument(type);
                }
            );
        });
}

async function createDocument(type) {
    const formatMap = {
        pdf: "pdf",
        word: "word",
        docx: "word",
        ppt: "pptx",
        pptx: "pptx",
        powerpoint: "pptx",
        excel: "xlsx",
        xlsx: "xlsx"
    };

    const format =
        formatMap[
            String(type || "").toLowerCase()
        ];

    if (!format) {
        showToast(
            "Unsupported document format."
        );

        return;
    }

    const promptText =
        window.prompt(
            `What should StudyMate create as a ${format.toUpperCase()}?`
        );

    if (!promptText || !promptText.trim()) {
        return;
    }

    const preview =
        document.querySelector(
            "#documentPreview"
        );

    if (preview) {
        preview.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>StudyMate AI is creating your document...</p>
            </div>
        `;
    }

    try {
        const response =
            await fetch(
                `${STUDYMATE_BACKEND}/api/generate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        format,
                        prompt:
                            promptText.trim()
                    })
                }
            );

        if (!response.ok) {
            let errorMessage =
                "Document generation failed.";

            try {
                const errorData =
                    await response.json();

                if (errorData.message) {
                    errorMessage =
                        errorData.message;
                }
            } catch {}

            throw new Error(
                errorMessage
            );
        }

        const blob =
            await response.blob();

        const disposition =
            response.headers.get(
                "Content-Disposition"
            );

        let filename =
            `studymate-document.${format === "word"
                ? "docx"
                : format}`;

        if (disposition) {
            const match =
                disposition.match(
                    /filename="?([^"]+)"?/i
                );

            if (match && match[1]) {
                filename = match[1];
            }
        }

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        if (preview) {
            preview.innerHTML = `
                <div class="success-state">
                    <div class="success-icon">✓</div>

                    <h3>
                        Document created successfully!
                    </h3>

                    <p>
                        Your ${format.toUpperCase()}
                        has been generated and downloaded.
                    </p>
                </div>
            `;
        }

        showToast(
            `${format.toUpperCase()} created successfully!`
        );

    } catch (error) {
        console.error(
            "Document generation error:",
            error
        );

        if (preview) {
            preview.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">!</div>

                    <h3>
                        Unable to create document
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Please make sure the StudyMate backend is running."
                        )}
                    </p>
                </div>
            `;
        }

        showToast(
            "Document generation failed."
        );
    }
}

/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function setupQuickActions() {
    document
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const action =
                        button.dataset.action;

                    if (!action) return;

                    switch (action) {
                        case "chat":
                            showView("chat");
                            break;

                        case "notes":
                            showView("notes");
                            break;

                        case "quiz":
                            showView("quiz");
                            break;

                        case "planner":
                            showView("planner");
                            break;

                        case "timer":
                            showView("timer");
                            break;

                        case "documents":
                        case "document":
                        case "document-studio":
                            showView(
                                "document-studio"
                            );
                            break;

                        case "library":
                            showView("library");
                            break;

                        default:
                            if (
                                document.getElementById(
                                    action
                                )
                            ) {
                                showView(action);
                            }
                    }
                }
            );
        });
}
/* =========================================================
   COMMAND PALETTE
   ========================================================= */

function setupCommandPalette() {
    const palette = document.querySelector("#commandPalette");
    const input = document.querySelector("#commandSearch");

    if (!palette) return;

    document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            openCommandPalette();
        }

        if (event.key === "Escape") {
            closeCommandPalette();
        }
    });

    const closeButton = palette.querySelector("[data-close-command]");
    if (closeButton) {
        closeButton.addEventListener("click", closeCommandPalette);
    }

    if (input) {
        input.addEventListener("input", () => {
            renderCommandResults(input.value);
        });
    }
}

function openCommandPalette() {
    const palette = document.querySelector("#commandPalette");

    if (!palette) return;

    palette.classList.add("active");

    const input = palette.querySelector("#commandSearch");

    if (input) {
        input.value = "";
        setTimeout(() => input.focus(), 50);
    }

    renderCommandResults("");
}

function closeCommandPalette() {
    const palette = document.querySelector("#commandPalette");

    if (!palette) return;

    palette.classList.remove("active");
}

function renderCommandResults(query = "") {
    const container = document.querySelector("#commandResults");

    if (!container) return;

    const commands = [
        {
            name: "Dashboard",
            keywords: "home dashboard",
            action: () => navigateTo("dashboard")
        },
        {
            name: "AI Tutor",
            keywords: "ai tutor chat study",
            action: () => navigateTo("ai-tutor")
        },
        {
            name: "Smart Notes",
            keywords: "notes summarize",
            action: () => navigateTo("smart-notes")
        },
        {
            name: "Quiz",
            keywords: "quiz test questions",
            action: () => navigateTo("quiz")
        },
        {
            name: "Planner",
            keywords: "planner timetable schedule",
            action: () => navigateTo("planner")
        },
        {
            name: "Library",
            keywords: "library files resources",
            action: () => navigateTo("library")
        },
        {
            name: "Document Studio",
            keywords: "document pdf word powerpoint excel",
            action: () => navigateTo("document-studio")
        },
        {
            name: "Start Study Timer",
            keywords: "timer focus pomodoro",
            action: () => {
                navigateTo("timer");

                if (typeof startTimer === "function") {
                    startTimer();
                }
            }
        }
    ];

    const normalizedQuery = query.trim().toLowerCase();

    const filtered = commands.filter(command => {
        if (!normalizedQuery) return true;

        return (
            command.name.toLowerCase().includes(normalizedQuery) ||
            command.keywords.toLowerCase().includes(normalizedQuery)
        );
    });

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No commands found</h3>
                <p>Try searching for Dashboard, Tutor, Quiz, Planner or Timer.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = filtered
        .map(
            command => `
                <button class="command-item" type="button">
                    <span>${escapeHTML(command.name)}</span>
                    <small>${escapeHTML(command.keywords)}</small>
                </button>
            `
        )
        .join("");

    container.querySelectorAll(".command-item").forEach((button, index) => {
        button.addEventListener("click", () => {
            filtered[index].action();
            closeCommandPalette();
        });
    });
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function setupDashboard() {
    updateDashboardStats();
    renderDashboardTasks();
    renderRecentActivity();
}

function updateDashboardStats() {
    const xpElement = document.querySelector("#dashboardXP");
    const levelElement = document.querySelector("#dashboardLevel");
    const streakElement = document.querySelector("#dashboardStreak");
    const taskElement = document.querySelector("#dashboardTasks");

    const xp = StudyMate.progress?.xp || 0;
    const level = StudyMate.progress?.level || "Beginner";
    const streak = StudyMate.progress?.streak || 0;

    const tasks = Array.isArray(StudyMate.tasks)
        ? StudyMate.tasks
        : [];

    const completedTasks = tasks.filter(task => task.completed).length;

    if (xpElement) {
        xpElement.textContent = xp;
    }

    if (levelElement) {
        levelElement.textContent = level;
    }

    if (streakElement) {
        streakElement.textContent = streak;
    }

    if (taskElement) {
        taskElement.textContent =
            `${completedTasks}/${tasks.length}`;
    }
}

function renderDashboardTasks() {
    const container = document.querySelector("#dashboardTaskList");

    if (!container) return;

    const tasks = Array.isArray(StudyMate.tasks)
        ? StudyMate.tasks.slice(0, 5)
        : [];

    if (!tasks.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No tasks yet</h3>
                <p>Add tasks in your planner to see them here.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = tasks
        .map(
            task => `
                <div class="dashboard-task ${task.completed ? "completed" : ""}">
                    <div>
                        <strong>${escapeHTML(task.title || "Study Task")}</strong>
                        <small>
                            ${escapeHTML(task.date || "Today")}
                        </small>
                    </div>

                    <span>
                        ${task.completed ? "✓ Done" : "Pending"}
                    </span>
                </div>
            `
        )
        .join("");
}

function renderRecentActivity() {
    const container = document.querySelector("#recentActivity");

    if (!container) return;

    const activity =
        Array.isArray(StudyMate.activity)
            ? StudyMate.activity.slice(0, 6)
            : [];

    if (!activity.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Your activity will appear here</h3>
                <p>Start studying to build your activity history.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = activity
        .map(
            item => `
                <div class="activity-item">
                    <div>
                        <strong>${escapeHTML(item.title || "StudyMate Activity")}</strong>
                        <small>${escapeHTML(item.time || "")}</small>
                    </div>
                </div>
            `
        )
        .join("");
}


/* =========================================================
   PROGRESS / XP
   ========================================================= */

function addXP(amount, reason = "Study activity") {
    if (!StudyMate.progress) {
        StudyMate.progress = {
            xp: 0,
            level: "Beginner",
            streak: 0
        };
    }

    const previousXP = Number(StudyMate.progress.xp) || 0;

    StudyMate.progress.xp = previousXP + Number(amount || 0);

    updateLevel();

    addActivity(reason);

    saveStudyMateData();

    updateDashboardStats();

    showToast(`+${amount} XP earned!`);
}

function updateLevel() {
    const xp = Number(StudyMate.progress.xp) || 0;

    let level = "Beginner";

    if (xp >= 1000) {
        level = "Master";
    } else if (xp >= 600) {
        level = "Advanced";
    } else if (xp >= 300) {
        level = "Intermediate";
    }

    StudyMate.progress.level = level;
}

function addActivity(title) {
    if (!Array.isArray(StudyMate.activity)) {
        StudyMate.activity = [];
    }

    StudyMate.activity.unshift({
        title,
        time: new Date().toLocaleString()
    });

    StudyMate.activity =
        StudyMate.activity.slice(0, 20);
}


/* =========================================================
   UTILITIES
   ========================================================= */

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function saveStudyMateData() {
    try {
        localStorage.setItem(
            "studymate-data",
            JSON.stringify({
                progress: StudyMate.progress,
                tasks: StudyMate.tasks,
                activity: StudyMate.activity,
                library: StudyMate.library,
                notes: StudyMate.notes
            })
        );
    } catch (error) {
        console.warn("Unable to save StudyMate data:", error);
    }
}

function loadStudyMateData() {
    try {
        const saved =
            localStorage.getItem("studymate-data");

        if (!saved) return;

        const data = JSON.parse(saved);

        if (data.progress) {
            StudyMate.progress = {
                ...StudyMate.progress,
                ...data.progress
            };
        }

        if (Array.isArray(data.tasks)) {
            StudyMate.tasks = data.tasks;
        }

        if (Array.isArray(data.activity)) {
            StudyMate.activity = data.activity;
        }

        if (Array.isArray(data.library)) {
            StudyMate.library = data.library;
        }

        if (Array.isArray(data.notes)) {
            StudyMate.notes = data.notes;
        }
    } catch (error) {
        console.warn("Unable to load StudyMate data:", error);
    }
}


/* =========================================================
   GLOBAL BUTTON HANDLING
   ========================================================= */

function setupGlobalButtons() {
    document.addEventListener("click", event => {
        const button =
            event.target.closest("[data-action]");

        if (!button) return;

        const action = button.dataset.action;

        if (action === "start-learning") {
            navigateTo("ai-tutor");
        }

        if (action === "open-planner") {
            navigateTo("planner");
        }

        if (action === "open-library") {
            navigateTo("library");
        }

        if (action === "open-documents") {
            navigateTo("document-studio");
        }

        if (action === "open-quiz") {
            navigateTo("quiz");
        }

        if (action === "open-timer") {
            navigateTo("timer");
        }
    });
}


/* =========================================================
   MODAL HANDLING
   ========================================================= */

function setupModals() {
    document.addEventListener("click", event => {
        const closeButton =
            event.target.closest("[data-close-modal]");

        if (closeButton) {
            const modal =
                closeButton.closest(".modal");

            if (modal) {
                modal.classList.remove("active");
            }
        }

        if (
            event.target.classList &&
            event.target.classList.contains("modal")
        ) {
            event.target.classList.remove("active");
        }
    });
}


/* =========================================================
   THEME / UI HELPERS
   ========================================================= */

function setupThemeToggle() {
    const buttons =
        document.querySelectorAll("[data-theme-toggle]");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");

            const isDark =
                document.body.classList.contains("dark-mode");

            localStorage.setItem(
                "studymate-theme",
                isDark ? "dark" : "light"
            );
        });
    });

    const savedTheme =
        localStorage.getItem("studymate-theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }
}


/* =========================================================
   INITIAL DATA LOADING
   ========================================================= */

loadStudyMateData();

setupCommandPalette();
setupGlobalButtons();
setupModals();
setupThemeToggle();

setupDashboard();

console.log("StudyMate loaded successfully.");
