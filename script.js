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


        /*
           Temporary fallback so the tutor
           still works while the backend
           is being configured.
        */

        const fallback =
            generateTutorResponse(message);


        addAssistantMessage(
            fallback
        );

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
        text.includes("hi")
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
                           
