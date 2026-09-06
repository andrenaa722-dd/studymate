/* =========================================================
   STUDYMATE
   Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initStudyMate();
});


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

    tasks: JSON.parse(localStorage.getItem("studymate_tasks") || "[]"),

    library: JSON.parse(localStorage.getItem("studymate_library") || "[]")
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

    // If user has already logged in, show dashboard
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
            const email = emailInput ? emailInput.value.trim() : "";

            if (!email) {
                showToast("Please enter your email.");
                return;
            }

            if (!isValidEmail(email)) {
                showToast("Please enter a valid email.");
                return;
            }

            StudyMate.user.email = email;

            localStorage.setItem("studymate_email", email);

            showRoleSelection();
        });
    }

    document.querySelectorAll("[data-role]").forEach(button => {
        button.addEventListener("click", () => {
            const role = button.dataset.role;

            if (!role) return;

            StudyMate.user.role = role;

            localStorage.setItem("studymate_role", role);

            hideOnboarding();
            updateUserInterface();
            updateDashboard();

            showToast(`Welcome to StudyMate, ${formatRole(role)}!`);
        });
    });

    const logoutBtn = document.querySelector("#logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}


function showOnboarding() {
    const onboarding = document.querySelector("#onboarding");

    if (onboarding) {
        onboarding.classList.remove("hidden");
    }

    document.body.classList.add("onboarding-active");
}


function hideOnboarding() {
    const onboarding = document.querySelector("#onboarding");

    if (onboarding) {
        onboarding.classList.add("hidden");
    }

    document.body.classList.remove("onboarding-active");
}


function showRoleSelection() {
    const emailStep = document.querySelector("#emailStep");
    const roleStep = document.querySelector("#roleStep");

    if (emailStep) {
        emailStep.classList.add("hidden");
    }

    if (roleStep) {
        roleStep.classList.remove("hidden");
    }
}


function logout() {
    localStorage.removeItem("studymate_email");
    localStorage.removeItem("studymate_role");

    StudyMate.user.email = "";
    StudyMate.user.role = "";

    const emailStep = document.querySelector("#emailStep");
    const roleStep = document.querySelector("#roleStep");

    if (emailStep) emailStep.classList.remove("hidden");
    if (roleStep) roleStep.classList.add("hidden");

    const emailInput = document.querySelector("#emailInput");

    if (emailInput) {
        emailInput.value = "";
    }

    showOnboarding();
}


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* =========================================================
   USER INTERFACE
   ========================================================= */

function updateUserInterface() {
    const email = StudyMate.user.email;
    const role = StudyMate.user.role;

    document.querySelectorAll("[data-user-email]").forEach(element => {
        element.textContent = email || "StudyMate User";
    });

    document.querySelectorAll("[data-user-role]").forEach(element => {
        element.textContent = formatRole(role || "student");
    });

    document.querySelectorAll("[data-role-dashboard]").forEach(element => {
        element.textContent = getRoleDashboardTitle(role);
    });

    updateRoleFacilities();
}


function formatRole(role) {
    if (!role) return "Student";

    return role.charAt(0).toUpperCase() + role.slice(1);
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
   ROLE-BASED FACILITIES
   ========================================================= */

function updateRoleFacilities() {
    const role = StudyMate.user.role || "student";

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

    document.querySelectorAll("[data-role-tools]").forEach(container => {
        container.innerHTML = "";

        tools.forEach(tool => {
            const item = document.createElement("div");

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
    document.querySelectorAll("[data-view]").forEach(button => {
        button.addEventListener("click", () => {
            const view = button.dataset.view;

            if (!view) return;

            showView(view);

            document.querySelectorAll("[data-view]").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            closeMobileSidebar();
        });
    });
}


function showView(viewName) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });

    const target = document.querySelector(`#${viewName}`);

    if (target) {
        target.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function closeMobileSidebar() {
    document.body.classList.remove("sidebar-open");
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {
    const searchInput = document.querySelector("#globalSearch");

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();

        document.querySelectorAll("[data-searchable]").forEach(item => {
            const text = item.textContent.toLowerCase();

            item.style.display =
                !query || text.includes(query)
                    ? ""
                    : "none";
        });
    });
}


/* =========================================================
   AI TUTOR / CHAT
   ========================================================= */

function setupChat() {
    const form = document.querySelector("#chatForm");
    const input = document.querySelector("#chatInput");

    if (form && input) {
        form.addEventListener("submit", event => {
            event.preventDefault();

            const message = input.value.trim();

            if (!message) return;

            addUserMessage(message);
            input.value = "";

            setTimeout(() => {
                addAssistantMessage(generateTutorResponse(message));
            }, 500);
        });
    }

    document.querySelectorAll("[data-prompt]").forEach(button => {
        button.addEventListener("click", () => {
            const prompt = button.dataset.prompt;

            if (input) {
                input.value = prompt;
                input.focus();
            }
        });
    });
}


function addUserMessage(message) {
    const chatMessages = document.querySelector("#chatMessages");

    if (!chatMessages) return;

    const messageElement = document.createElement("div");

    messageElement.className = "message user-message";

    messageElement.innerHTML = `
        <div class="message-content">
            ${escapeHTML(message)}
        </div>
    `;

    chatMessages.appendChild(messageElement);

    scrollChatToBottom();
}


function addAssistantMessage(message) {
    const chatMessages = document.querySelector("#chatMessages");

    if (!chatMessages) return;

    const messageElement = document.createElement("div");

    messageElement.className = "message assistant-message";

    messageElement.innerHTML = `
        <div class="message-avatar">✦</div>
        <div class="message-content">
            ${formatText(message)}
        </div>
    `;

    chatMessages.appendChild(messageElement);

    scrollChatToBottom();
}


function scrollChatToBottom() {
    const chatMessages = document.querySelector("#chatMessages");

    if (!chatMessages) return;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function generateTutorResponse(message) {
    const text = message.toLowerCase();

    if (text.includes("hello") || text.includes("hi")) {
        return "Hey! 👋 I'm your StudyMate AI Tutor. What would you like to learn today?";
    }

    if (text.includes("sql")) {
        return `
            <strong>SQL in simple words:</strong><br><br>
            SQL is used to communicate with databases.<br><br>
            <strong>DDL:</strong> CREATE, ALTER, DROP, TRUNCATE<br>
            <strong>DML:</strong> INSERT, UPDATE, DELETE<br>
            <strong>DQL:</strong> SELECT<br><br>
            Think of a database as a digital cupboard and SQL as the language you use to organize and retrieve what's inside.
        `;
    }

    if (text.includes("stack")) {
        return `
            A <strong>Stack</strong> follows <strong>LIFO</strong> — Last In, First Out.<br><br>
            Example: a stack of plates. The last plate placed on top is the first one removed.<br><br>
            Main operations:<br>
            • Push — add an item<br>
            • Pop — remove an item<br>
            • Peek — view the top item
        `;
    }

    if (text.includes("python")) {
        return `
            Python is a high-level, easy-to-read programming language.<br><br>
            Example:<br><br>
            <code>print("Hello, StudyMate!")</code><br><br>
            This tells Python to display the text on the screen.
        `;
    }

    if (text.includes("exam") || text.includes("study")) {
        return `
            Let's turn that into a study plan 📚<br><br>
            1. Understand the concept.<br>
            2. Write a short summary.<br>
            3. Solve 3–5 questions.<br>
            4. Take a short break.<br>
            5. Test yourself without looking at your notes.
        `;
    }

    return `
        That's a great question! 🧠<br><br>
        I can help you understand concepts, create revision notes, generate quizzes, build study plans, explain programming topics, and organize your study material.<br><br>
        Try asking me something specific, such as <em>"Explain merge sort in simple words."</em>
    `;
}


/* =========================================================
   SMART NOTES
   ========================================================= */

function setupNotes() {
    const summarizeBtn = document.querySelector("#summarizeBtn");
    const notesInput = document.querySelector("#notesInput");

    if (summarizeBtn && notesInput) {
        summarizeBtn.addEventListener("click", () => {
            const text = notesInput.value.trim();

            if (!text) {
                showToast("Add some text first.");
                return;
            }

            const summary = createSummary(text);

            StudyMate.notes.currentText = summary;

            const output = document.querySelector("#notesOutput");

            if (output) {
                output.innerHTML = formatText(summary);
            }

            showToast("Summary created!");
        });
    }

    const copyBtn = document.querySelector("#copyNotesBtn");

    if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
            const output = document.querySelector("#notesOutput");

            if (!output) return;

            try {
                await navigator.clipboard.writeText(output.innerText);
                showToast("Notes copied!");
            } catch {
                showToast("Unable to copy notes.");
            }
        });
    }
}


function createSummary(text) {
    const sentences = text
        .replace(/\s+/g, " ")
        .split(/[.!?]+/)
        .map(sentence => sentence.trim())
        .filter(Boolean);

    if (sentences.length <= 3) {
        return `### Quick Summary\n\n${sentences.map(s => `• ${s}`).join("\n")}`;
    }

    const important = sentences.slice(0, Math.max(3, Math.ceil(sentences.length * 0.4)));

    return `
### Quick Summary

${important.map(sentence => `• ${sentence}`).join("\n")}

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
    const generateQuizBtn = document.querySelector("#generateQuizBtn");

    if (generateQuizBtn) {
        generateQuizBtn.addEventListener("click", () => {
            const topicInput = document.querySelector("#quizTopic");
            const topic = topicInput ? topicInput.value.trim() : "";

            if (!topic) {
                showToast("Enter a topic first.");
                return;
            }

            StudyMate.quiz.questions = generateQuizQuestions(topic);
            StudyMate.quiz.current = 0;
            StudyMate.quiz.score = 0;

            renderQuiz();

            showToast("Quiz generated!");
        });
    }
}


function generateQuizQuestions(topic) {
    return [
        {
            question: `What is the main purpose of studying ${topic}?`,
            options: [
                "To understand and apply its concepts",
                "To avoid learning anything",
                "To memorize random words",
                "None of the above"
            ],
            answer: 0,
            explanation: `The main goal is to understand the concepts of ${topic} and apply them correctly.`
        },

        {
            question: `Which approach is generally best when learning ${topic}?`,
            options: [
                "Understand the fundamentals first",
                "Skip the basics",
                "Only memorize definitions",
                "Never practice"
            ],
            answer: 0,
            explanation: "Strong fundamentals make advanced concepts much easier to understand."
        },

        {
            question: `Which technique can improve your understanding of ${topic}?`,
            options: [
                "Active recall and practice",
                "Ignoring mistakes",
                "Studying without breaks",
                "Avoiding questions"
            ],
            answer: 0,
            explanation: "Active recall and practice help strengthen understanding and memory."
        }
    ];
}


function renderQuiz() {
    const container = document.querySelector("#quizContainer");

    if (!container) return;

    const questions = StudyMate.quiz.questions;

    if (!questions.length) {
        container.innerHTML = `
            <div class="empty-state">
                Generate a quiz to begin.
            </div>
        `;
        return;
    }

    const current = questions[StudyMate.quiz.current];

    container.innerHTML = `
        <div class="quiz-question">
            <div class="quiz-progress">
                Question ${StudyMate.quiz.current + 1} of ${questions.length}
            </div>

            <h3>${escapeHTML(current.question)}</h3>

            <div class="quiz-options">
                ${current.options.map((option, index) => `
                    <button
                        class="quiz-option"
                        data-option="${index}">
                        ${escapeHTML(option)}
                    </button>
                `).join("")}
            </div>
        </div>
    `;

    container.querySelectorAll(".quiz-option").forEach(button => {
        button.addEventListener("click", () => {
            answerQuiz(Number(button.dataset.option));
        });
    });
}


function answerQuiz(selected) {
    const question = StudyMate.quiz.questions[StudyMate.quiz.current];

    const buttons = document.querySelectorAll(".quiz-option");

    buttons.forEach(button => {
        button.disabled = true;

        const index = Number(button.dataset.option);

        if (index === question.answer) {
            button.classList.add("correct");
        }

        if (index === selected && selected !== question.answer) {
            button.classList.add("incorrect");
        }
    });

    if (selected === question.answer) {
        StudyMate.quiz.score++;
    }

    setTimeout(() => {
        StudyMate.quiz.current++;

        if (StudyMate.quiz.current >= StudyMate.quiz.questions.length) {
            showQuizResult();
        } else {
            renderQuiz();
        }
    }, 900);
}


function showQuizResult() {
    const container = document.querySelector("#quizContainer");

    if (!container) return;

    const total = StudyMate.quiz.questions.length;
    const score = StudyMate.quiz.score;
    const percentage = Math.round((score / total) * 100);

    container.innerHTML = `
        <div class="quiz-result">
            <div class="result-icon">🎉</div>

            <h2>Quiz Complete!</h2>

            <div class="result-score">
                ${score} / ${total}
            </div>

            <p>You scored ${percentage}%.</p>

            <button class="primary-btn" id="restartQuizBtn">
                Try Again
            </button>
        </div>
    `;

    document.querySelector("#restartQuizBtn")?.addEventListener("click", () => {
        StudyMate.quiz.current = 0;
        StudyMate.quiz.score = 0;
        renderQuiz();
    });
}


/* =========================================================
   STUDY PLANNER
   ========================================================= */

function setupPlanner() {
    const taskForm = document.querySelector("#taskForm");

    if (!taskForm) return;

    taskForm.addEventListener("submit", event => {
        event.preventDefault();

        const titleInput = document.querySelector("#taskTitle");
        const subjectInput = document.querySelector("#taskSubject");

        const title = titleInput ? titleInput.value.trim() : "";
        const subject = subjectInput ? subjectInput.value.trim() : "";

        if (!title) {
            showToast("Enter a task.");
            return;
        }

        const task = {
            id: Date.now(),
            title,
            subject: subject || "General",
            completed: false,
            created: new Date().toISOString()
        };

        StudyMate.tasks.push(task);

        saveTasks();
        renderTasks();

        taskForm.reset();

        showToast("Task added!");
    });
}


function saveTasks() {
    localStorage.setItem(
        "studymate_tasks",
        JSON.stringify(StudyMate.tasks)
    );
}


function renderTasks() {
    const container = document.querySelector("#taskList");

    if (!container) return;

    if (!StudyMate.tasks.length) {
        container.innerHTML = `
            <div class="empty-state">
                No study tasks yet. Add one above.
            </div>
        `;
        return;
    }

    container.innerHTML = StudyMate.tasks.map(task => `
        <div class="task-item ${task.completed ? "completed" : ""}"
             data-searchable>

            <label class="task-check">
                <input
                    type="checkbox"
                    data-task-id="${task.id}"
                    ${task.completed ? "checked" : ""}
                >

                <span></span>
            </label>

            <div class="task-info">
                <strong>${escapeHTML(task.title)}</strong>
                <small>${escapeHTML(task.subject)}</small>
            </div>

            <button
                class="task-delete"
                data-delete-task="${task.id}">
                ×
            </button>
        </div>
    `).join("");

    container.querySelectorAll("[data-task-id]").forEach(input => {
        input.addEventListener("change", () => {
            const id = Number(input.dataset.taskId);

            const task = StudyMate.tasks.find(item => item.id === id);

            if (task) {
                task.completed = input.checked;
                saveTasks();
                renderTasks();
                updateDashboard();
            }
        });
    });

    container.querySelectorAll("[data-delete-task]").forEach(button => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.deleteTask);

            StudyMate.tasks = StudyMate.tasks.filter(
                task => task.id !== id
            );

            saveTasks();
            renderTasks();
            updateDashboard();
        });
    });
}


/* =========================================================
   TIMER
   ========================================================= */

function setupTimer() {
    document.querySelectorAll("[data-timer]").forEach(button => {
        button.addEventListener("click", () => {
            const mode = button.dataset.timer;

            setTimerMode(mode);
        });
    });

    const startBtn = document.querySelector("#timerStart");
    const resetBtn = document.querySelector("#timerReset");

    if (startBtn) {
        startBtn.addEventListener("click", toggleTimer);
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", resetTimer);
    }
}


function setTimerMode(mode) {
    clearInterval(StudyMate.timer.interval);

    StudyMate.timer.running = false;
    StudyMate.timer.mode = mode;

    if (mode === "focus") {
        StudyMate.timer.duration = 25 * 60;
    } else if (mode === "short") {
        StudyMate.timer.duration = 5 * 60;
    } else if (mode === "long") {
        StudyMate.timer.duration = 15 * 60;
    }

    StudyMate.timer.remaining = StudyMate.timer.duration;

    updateTimerDisplay();
}


function toggleTimer() {
    if (StudyMate.timer.running) {
        pauseTimer();
    } else {
        startTimer();
    }
}


function startTimer() {
    StudyMate.timer.running = true;

    updateTimerButton();

    StudyMate.timer.interval = setInterval(() => {
        StudyMate.timer.remaining--;

        updateTimerDisplay();

        if (StudyMate.timer.remaining <= 0) {
            finishTimer();
        }
    }, 1000);
}


function pauseTimer() {
    clearInterval(StudyMate.timer.interval);

    StudyMate.timer.running = false;

    updateTimerButton();
}


function resetTimer() {
    clearInterval(StudyMate.timer.interval);

    StudyMate.timer.running = false;
    StudyMate.timer.remaining = StudyMate.timer.duration;

    updateTimerDisplay();
    updateTimerButton();
}


function finishTimer() {
    clearInterval(StudyMate.timer.interval);

    StudyMate.timer.running = false;
    StudyMate.timer.remaining = 0;

    updateTimerDisplay();
    updateTimerButton();

    showToast("Timer complete! 🎉");

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("StudyMate", {
            body: "Your study session is complete!"
        });
    }
}


function updateTimerDisplay() {
    const remaining = StudyMate.timer.remaining;

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const formatted =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    document.querySelectorAll("[data-timer-display]").forEach(element => {
        element.textContent = formatted;
    });

    const ring = document.querySelector("[data-timer-ring]");

    if (ring) {
        const percentage =
            (remaining / StudyMate.timer.duration) * 100;

        ring.style.setProperty(
            "--timer-progress",
            `${percentage}%`
        );
    }
}


function updateTimerButton() {
    const button = document.querySelector("#timerStart");

    if (!button) return;

    button.textContent =
        StudyMate.timer.running
            ? "Pause"
            : "Start Focus";
}


/* =========================================================
   LIBRARY
   ========================================================= */

function setupLibrary() {
    const fileInput = document.querySelector("#fileInput");

    if (!fileInput) return;

    fileInput.addEventListener("change", event => {
        const files = Array.from(event.target.files);

        files.forEach(file => {
            const item = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: file.type || "document",
                size: file.size,
                date: new Date().toISOString()
            };

            StudyMate.library.unshift(item);
        });

        localStorage.setItem(
            "studymate_library",
            JSON.stringify(StudyMate.library)
        );

        renderLibrary();

        showToast(
            files.length === 1
                ? "Material added to your library!"
                : `${files.length} materials added!`
        );
    });
}


function renderLibrary() {
    const container = document.querySelector("#libraryGrid");

    if (!container) return;

    if (!StudyMate.library.length) {
        container.innerHTML = `
            <div class="empty-state">
                Your study library is empty.
                Upload notes, PDFs or study material to begin.
            </div>
        `;
        return;
    }

    container.innerHTML = StudyMate.library.map(item => `
        <div class="library-item" data-searchable>
            <div class="library-icon">
                ${getFileIcon(item.name)}
            </div>

            <div class="library-info">
                <strong>${escapeHTML(item.name)}</strong>
                <small>${formatFileSize(item.size)}</small>
            </div>

            <button
                class="library-delete"
                data-library-delete="${item.id}">
                ×
            </button>
        </div>
    `).join("");

    container.querySelectorAll("[data-library-delete]").forEach(button => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.libraryDelete);

            StudyMate.library = StudyMate.library.filter(
                item => item.id !== id
            );

            localStorage.setItem(
                "studymate_library",
                JSON.stringify(StudyMate.library)
            );

            renderLibrary();

            showToast("Material removed.");
        });
    });
}


function getFileIcon(filename) {
    const extension = filename.split(".").pop().toLowerCase();

    if (extension === "pdf") return "📕";
    if (extension === "ppt" || extension === "pptx") return "📊";
    if (extension === "xls" || extension === "xlsx") return "📈";
    if (extension === "doc" || extension === "docx") return "📄";

    return "📁";
}


function formatFileSize(bytes) {
    if (!bytes) return "Unknown size";

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


/* =========================================================
   DOCUMENT STUDIO
   ========================================================= */

function setupDocumentStudio() {
    document.querySelectorAll("[data-create-document]").forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.createDocument;

            createDocument(type);
        });
    });
}


function createDocument(type) {
    const templates = {
        pdf: `
            <h2>Study Notes</h2>
            <p>Generated by StudyMate.</p>
            <h3>Key Concepts</h3>
            <p>Add your important concepts here.</p>
        `,

        ppt: `
            <h2>Presentation Outline</h2>
            <p>Slide 1 — Introduction</p>
            <p>Slide 2 — Main Concept</p>
            <p>Slide 3 — Examples</p>
            <p>Slide 4 — Summary</p>
        `,

        excel: `
            <h2>Revision Tracker</h2>
            <p>Topic | Status | Score</p>
            <p>Database Systems | Pending | —</p>
            <p>Data Structures | Pending | —</p>
        `,

        flashcards: `
            <h2>Flashcards</h2>
            <p><strong>Q:</strong> What is LIFO?</p>
            <p><strong>A:</strong> Last In, First Out.</p>
        `
    };

    const output = document.querySelector("#documentPreview");

    if (output) {
        output.innerHTML =
            templates[type] ||
            "<h2>New StudyMate Document</h2>";

        showToast("Document created!");
    }
}


/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function setupQuickActions() {
    document.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;

            handleQuickAction(action);
        });
    });
}


function handleQuickAction(action) {
    switch (action) {
        case "tutor":
            showView("chatView");
            break;

        case "summarize":
            showView("notesView");
            break;

        case "quiz":
            showView("quizView");
            break;

        case "plan":
            showView("plannerView");
            break;

        case "timer":
            showView("timerView");
            break;

        case "library":
            showView("libraryView");
            break;

        case "documents":
            showView("documentsView");
            break;

        default:
            showToast("This StudyMate feature is coming soon!");
    }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {
    const totalTasks = StudyMate.tasks.length;

    const completedTasks =
        StudyMate.tasks.filter(task => task.completed).length;

    const progress =
        totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

    document.querySelectorAll("[data-progress]").forEach(element => {
        element.textContent = `${progress}%`;
    });

    document.querySelectorAll("[data-task-count]").forEach(element => {
        element.textContent = totalTasks;
    });

    document.querySelectorAll("[data-completed-count]").forEach(element => {
        element.textContent = completedTasks;
    });

    const progressBars =
        document.querySelectorAll("[data-progress-bar]");

    progressBars.forEach(bar => {
        bar.style.width = `${progress}%`;
    });
}


/* =========================================================
   COMMAND PALETTE
   ========================================================= */

function setupCommandPalette() {
    const palette = document.querySelector("#commandPalette");
    const input = document.querySelector("#commandInput");

    document.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();

            if (palette) {
                palette.classList.toggle("active");

                if (palette.classList.contains("active")) {
                    input?.focus();
                }
            }
        }

        if (event.key === "Escape") {
            palette?.classList.remove("active");
        }
    });

    if (input) {
        input.addEventListener("input", () => {
            const query = input.value.toLowerCase();

            document.querySelectorAll("[data-command]").forEach(item => {
                item.style.display =
                    item.textContent.toLowerCase().includes(query)
                        ? ""
                        : "none";
            });
        });
    }

    document.querySelectorAll("[data-command]").forEach(command => {
        command.addEventListener("click", () => {
            const view = command.dataset.command;

            palette?.classList.remove("active");

            if (view) {
                showView(view);
            }
        });
    });
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {
    let toast = document.querySelector("#toast");

    if (!toast) {
        toast = document.createElement("div");

        toast.id = "toast";
        toast.className = "toast";

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.studyMateToast);

    window.studyMateToast = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================================================
   UTILITIES
   ========================================================= */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatText(text) {
    return escapeHTML(text)
        .replace(/^### (.*)$/gm, "<h3>$1</h3>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
}


/* =========================================================
   NOTIFICATION PERMISSION
   ========================================================= */

if ("Notification" in window) {
    if (Notification.permission === "default") {
        // We don't automatically request permission.
        // The browser will ask only when needed.
    }
}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener("keydown", event => {
    // "/" focuses search
    if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(
            document.activeElement.tagName
        )
    ) {
        event.preventDefault();

        const search = document.querySelector("#globalSearch");

        if (search) {
            search.focus();
        }
    }
});


/* =========================================================
   STUDYMATE READY
   ========================================================= */

console.log("StudyMate loaded successfully 🚀");
