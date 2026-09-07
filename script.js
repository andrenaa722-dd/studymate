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

                    if (!prompt) return;

                    if (input) {
                        input.value = prompt;
                        input.focus();
                    }

                }
            );

        });

}


function addUserMessage(message) {

    StudyMate.chat.messages.push({
        role: "user",
        content: message
    });


    renderChatMessage(
        "user",
        message
    );

}


function addAssistantMessage(message) {

    StudyMate.chat.messages.push({
        role: "assistant",
        content: message
    });


    renderChatMessage(
        "assistant",
        message
    );

}


function renderChatMessage(role, message) {

    const chatMessages =
        document.querySelector("#chatMessages");

    if (!chatMessages) return;


    const messageElement =
        document.createElement("div");

    messageElement.className =
        `chat-message ${role}`;


    messageElement.innerHTML = `
        <div class="chat-message-content">
            ${escapeHTML(message)}
        </div>
    `;


    chatMessages.appendChild(
        messageElement
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


async function askStudyMateAI(message) {

    const typing =
        document.querySelector("#typingIndicator");

    if (typing) {
        typing.classList.remove("hidden");
    }


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
                        message,
                        role:
                            StudyMate.user.role ||
                            "student",
                        history:
                            StudyMate.chat.messages
                    })
                }
            );


        if (!response.ok) {
            throw new Error(
                `Server error: ${response.status}`
            );
        }


        const data =
            await response.json();


        const reply =
            data.reply ||
            data.message ||
            "I couldn't generate a response.";


        addAssistantMessage(reply);


    } catch (error) {

        console.error(
            "AI Tutor error:",
            error
        );


        addAssistantMessage(
            "I'm having trouble connecting to the AI Tutor right now. Please make sure the StudyMate backend is running."
        );

    } finally {

        if (typing) {
            typing.classList.add("hidden");
        }

    }

}


/* =========================================================
   UTILITY
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


function showToast(message) {

    let toast =
        document.querySelector("#studyMateToast");


    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "studyMateToast";

        toast.className =
            "study-mate-toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent = message;

    toast.classList.add("show");


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);

}
    const copyBtn =
        document.querySelector(
            "#copyNotesBtn"
        );


    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            async () => {

                const text =
                    StudyMate.notes.currentText;

                if (!text) {
                    showToast(
                        "Create a summary first."
                    );
                    return;
                }

                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    showToast(
                        "Notes copied!"
                    );

                } catch (error) {

                    showToast(
                        "Could not copy notes."
                    );

                }

            }
        );

    }


    const clearBtn =
        document.querySelector(
            "#clearNotesBtn"
        );


    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            () => {

                if (notesInput) {
                    notesInput.value = "";
                }

                const output =
                    document.querySelector(
                        "#notesOutput"
                    );

                if (output) {
                    output.innerHTML = "";
                }

                StudyMate.notes.currentText =
                    "";

            }
        );

    }

}


/* =========================================================
   SUMMARY ENGINE
   ========================================================= */

function createSummary(text) {

    const cleaned =
        text
            .replace(/\s+/g, " ")
            .trim();

    if (!cleaned) {
        return "";
    }


    const sentences =
        cleaned
            .split(/(?<=[.!?])\s+/)
            .filter(Boolean);


    if (sentences.length <= 4) {
        return sentences.join(" ");
    }


    const important =
        sentences.slice(
            0,
            Math.min(6, sentences.length)
        );


    return important.join(" ");
}


/* =========================================================
   STUDY PLANNER
   ========================================================= */

function setupPlanner() {

    const form =
        document.querySelector(
            "#taskForm"
        );

    const input =
        document.querySelector(
            "#taskInput"
        );

    const dateInput =
        document.querySelector(
            "#taskDate"
        );


    if (form && input) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const title =
                    input.value.trim();

                if (!title) {
                    showToast(
                        "Enter a task first."
                    );
                    return;
                }


                const task = {
                    id: Date.now(),
                    title: title,
                    date:
                        dateInput
                            ? dateInput.value
                            : "",
                    completed: false
                };


                StudyMate.tasks.push(
                    task
                );


                saveTasks();
                renderTasks();


                input.value = "";

                if (dateInput) {
                    dateInput.value = "";
                }


                showToast(
                    "Task added!"
                );

            }
        );

    }


    document.addEventListener(
        "click",
        event => {

            const completeButton =
                event.target.closest(
                    "[data-task-complete]"
                );

            if (completeButton) {

                const id =
                    Number(
                        completeButton.dataset.taskComplete
                    );

                toggleTask(id);

                return;
            }


            const deleteButton =
                event.target.closest(
                    "[data-task-delete]"
                );

            if (deleteButton) {

                const id =
                    Number(
                        deleteButton.dataset.taskDelete
                    );

                deleteTask(id);

            }

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


function toggleTask(id) {

    const task =
        StudyMate.tasks.find(
            item => item.id === id
        );

    if (!task) return;


    task.completed =
        !task.completed;


    saveTasks();
    renderTasks();


    showToast(
        task.completed
            ? "Task completed!"
            : "Task reopened."
    );

}


function deleteTask(id) {

    StudyMate.tasks =
        StudyMate.tasks.filter(
            task => task.id !== id
        );


    saveTasks();
    renderTasks();


    showToast(
        "Task deleted."
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
                <div class="empty-icon">✓</div>
                <p>No tasks yet.</p>
                <span>Add a task to start planning.</span>
            </div>
        `;

        return;
    }


    container.innerHTML =
        StudyMate.tasks
            .map(task => {

                const completedClass =
                    task.completed
                        ? "completed"
                        : "";


                return `
                    <div class="task-item ${completedClass}">
                        <button
                            class="task-check"
                            data-task-complete="${task.id}"
                            aria-label="Complete task"
                        >
                            ${task.completed ? "✓" : ""}
                        </button>

                        <div class="task-info">
                            <strong>
                                ${escapeHTML(task.title)}
                            </strong>

                            ${
                                task.date
                                    ? `
                                        <span>
                                            ${escapeHTML(task.date)}
                                        </span>
                                    `
                                    : ""
                            }
                        </div>

                        <button
                            class="task-delete"
                            data-task-delete="${task.id}"
                            aria-label="Delete task"
                        >
                            ×
                        </button>
                    </div>
                `;

            })
            .join("");

}


/* =========================================================
   QUIZ SYSTEM
   ========================================================= */

function setupQuiz() {

    const startButton =
        document.querySelector(
            "#startQuizBtn"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            () => {

                startQuiz();

            }
        );

    }


    document.addEventListener(
        "click",
        event => {

            const option =
                event.target.closest(
                    "[data-quiz-option]"
                );

            if (!option) return;


            const answer =
                Number(
                    option.dataset.quizOption
                );


            submitQuizAnswer(
                answer
            );

        }
    );

}


function startQuiz() {

    StudyMate.quiz.questions =
        generateQuizQuestions();


    StudyMate.quiz.current = 0;
    StudyMate.quiz.score = 0;


    renderQuizQuestion();

}


function generateQuizQuestions() {

    return [

        {
            question:
                "Which SQL command is used to retrieve data?",

            options: [
                "INSERT",
                "SELECT",
                "DELETE",
                "ALTER"
            ],

            answer: 1
        },

        {
            question:
                "Which data structure follows LIFO?",

            options: [
                "Queue",
                "Array",
                "Stack",
                "Linked List"
            ],

            answer: 2
        },

        {
            question:
                "Which language is known for its readable syntax?",

            options: [
                "Python",
                "Assembly",
                "Machine Code",
                "Binary"
            ],

            answer: 0
        },

        {
            question:
                "Which sorting algorithm uses a pivot?",

            options: [
                "Merge Sort",
                "Quick Sort",
                "Bubble Sort",
                "Selection Sort"
            ],

            answer: 1
        },

        {
            question:
                "What does DDL stand for?",

            options: [
                "Data Definition Language",
                "Data Design Language",
                "Database Data Logic",
                "Digital Definition Language"
            ],

            answer: 0
        }

    ];

}


function renderQuizQuestion() {

    const container =
        document.querySelector(
            "#quizContainer"
        );


    if (!container) return;


    const questions =
        StudyMate.quiz.questions;


    if (
        StudyMate.quiz.current >=
        questions.length
    ) {

        showQuizResult();

        return;

    }


    const question =
        questions[
            StudyMate.quiz.current
        ];


    container.innerHTML = `

        <div class="quiz-progress">
            Question
            ${StudyMate.quiz.current + 1}
            of
            ${questions.length}
        </div>

        <h3>
            ${escapeHTML(
                question.question
            )}
        </h3>

        <div class="quiz-options">

            ${question.options
                .map(
                    (option, index) => `
                        <button
                            class="quiz-option"
                            data-quiz-option="${index}"
                        >
                            ${escapeHTML(option)}
                        </button>
                    `
                )
                .join("")}

        </div>
    `;

}


function submitQuizAnswer(answer) {

    const question =
        StudyMate.quiz.questions[
            StudyMate.quiz.current
        ];


    if (!question) return;


    if (answer === question.answer) {

        StudyMate.quiz.score++;

        showToast(
            "Correct! 🎉"
        );

    } else {

        showToast(
            "Not quite. Keep going!"
        );

    }


    StudyMate.quiz.current++;


    setTimeout(
        renderQuizQuestion,
        350
    );

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
        total
            ? Math.round(
                (score / total) * 100
            )
            : 0;


    container.innerHTML = `

        <div class="quiz-result">

            <div class="result-icon">
                🏆
            </div>

            <h3>
                Quiz Complete!
            </h3>

            <p>
                You scored
                <strong>
                    ${score}/${total}
                </strong>
            </p>

            <div class="quiz-score">
                ${percentage}%
            </div>

            <button
                class="primary-btn"
                id="restartQuizBtn"
            >
                Try Again
            </button>

        </div>
    `;


    const restartButton =
        document.querySelector(
            "#restartQuizBtn"
        );


    if (restartButton) {

        restartButton.addEventListener(
            "click",
            startQuiz
        );

    }

}


/* =========================================================
   LIBRARY
   ========================================================= */

function setupLibrary() {

    const searchInput =
        document.querySelector(
            "#librarySearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                renderLibrary(
                    searchInput.value
                );

            }
        );

    }


    document.addEventListener(
        "click",
        event => {

            const deleteButton =
                event.target.closest(
                    "[data-library-delete]"
                );


            if (!deleteButton) return;


            const id =
                Number(
                    deleteButton.dataset.libraryDelete
                );


            StudyMate.library =
                StudyMate.library.filter(
                    item => item.id !== id
                );


            saveLibrary();
            renderLibrary();


            showToast(
                "Library item removed."
            );

        }
    );

}


function saveLibrary() {

    localStorage.setItem(
        "studymate_library",
        JSON.stringify(
            StudyMate.library
        )
    );

}


function addToLibrary(
    title,
    type,
    content
) {

    const item = {

        id: Date.now(),

        title:
            title || "Study Material",

        type:
            type || "note",

        content:
            content || "",

        createdAt:
            new Date().toISOString()

    };


    StudyMate.library.unshift(
        item
    );


    saveLibrary();
    renderLibrary();


    showToast(
        "Added to library!"
    );

}


function renderLibrary(
    searchTerm = ""
) {

    const container =
        document.querySelector(
            "#libraryList"
        );


    if (!container) return;


    const search =
        searchTerm
            .toLowerCase()
            .trim();


    const items =
        StudyMate.library.filter(
            item => {

                if (!search) {
                    return true;
                }


                return (
                    item.title
                        .toLowerCase()
                        .includes(search)
                    ||
                    item.type
                        .toLowerCase()
                        .includes(search)
                );

            }
        );


    if (!items.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <p>Your library is empty.</p>
                <span>
                    Save your study materials here.
                </span>
            </div>
        `;

        return;

    }


    container.innerHTML =
        items
            .map(
                item => `

                    <div class="library-item">

                        <div class="library-icon">
                            ${getLibraryIcon(item.type)}
                        </div>

                        <div class="library-info">

                            <strong>
                                ${escapeHTML(item.title)}
                            </strong>

                            <span>
                                ${escapeHTML(item.type)}
                            </span>

                        </div>

                        <button
                            class="library-delete"
                            data-library-delete="${item.id}"
                        >
                            ×
                        </button>

                    </div>

                `
            )
            .join("");

}


function getLibraryIcon(type) {

    const icons = {

        pdf: "📕",

        word: "📘",

        docx: "📘",

        ppt: "📊",

        pptx: "📊",

        excel: "📗",

        xlsx: "📗",

        note: "📝"

    };


    return (
        icons[type] ||
        "📄"
    );

}
            StudyMate.tasks.push(task);

            saveTasks();
            renderTasks();

            if (titleInput) {
                titleInput.value = "";
            }

            if (subjectInput) {
                subjectInput.value = "";
            }

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
                <div class="empty-icon">📋</div>
                <p>No tasks yet.</p>
                <span>Add your first study task.</span>
            </div>
        `;

        return;

    }


    container.innerHTML =
        StudyMate.tasks
            .map(
                task => `

                    <div class="task-item ${
                        task.completed
                            ? "completed"
                            : ""
                    }">

                        <button
                            class="task-check"
                            data-task-id="${task.id}"
                        >
                            ${
                                task.completed
                                    ? "✓"
                                    : ""
                            }
                        </button>

                        <div class="task-info">

                            <strong>
                                ${escapeHTML(
                                    task.title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    task.subject
                                )}
                            </span>

                        </div>

                        <button
                            class="task-delete"
                            data-delete-task="${task.id}"
                        >
                            ×
                        </button>

                    </div>

                `
            )
            .join("");


    container
        .querySelectorAll(
            "[data-task-id]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.taskId
                        );

                    const task =
                        StudyMate.tasks.find(
                            item =>
                                item.id === id
                        );

                    if (!task) return;

                    task.completed =
                        !task.completed;

                    saveTasks();
                    renderTasks();

                }
            );

        });


    container
        .querySelectorAll(
            "[data-delete-task]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.deleteTask
                        );

                    StudyMate.tasks =
                        StudyMate.tasks.filter(
                            item =>
                                item.id !== id
                        );

                    saveTasks();
                    renderTasks();

                    showToast(
                        "Task deleted."
                    );

                }
            );

        });

}


/* =========================================================
   LIBRARY
   ========================================================= */

function setupLibrary() {

    const searchInput =
        document.querySelector(
            "#librarySearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                renderLibrary(
                    searchInput.value
                );

            }
        );

    }


    renderLibrary();

}


function saveLibrary() {

    localStorage.setItem(
        "studymate_library",
        JSON.stringify(
            StudyMate.library
        )
    );

}


function addLibraryItem(
    title,
    type,
    content
) {

    const item = {

        id: Date.now(),

        title:
            title || "Study Material",

        type:
            type || "note",

        content:
            content || "",

        createdAt:
            new Date().toISOString()

    };


    StudyMate.library.unshift(
        item
    );


    saveLibrary();
    renderLibrary();


    showToast(
        "Saved to library!"
    );

}


function renderLibrary(
    searchTerm = ""
) {

    const container =
        document.querySelector(
            "#libraryList"
        );


    if (!container) return;


    const search =
        searchTerm
            .toLowerCase()
            .trim();


    const filtered =
        StudyMate.library.filter(
            item => {

                if (!search) {
                    return true;
                }


                return (
                    item.title
                        .toLowerCase()
                        .includes(search)
                    ||
                    item.type
                        .toLowerCase()
                        .includes(search)
                );

            }
        );


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <p>No saved materials.</p>
                <span>
                    Your study documents will appear here.
                </span>
            </div>
        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                item => `

                    <div class="library-item">

                        <div class="library-icon">
                            ${getLibraryIcon(
                                item.type
                            )}
                        </div>

                        <div class="library-info">

                            <strong>
                                ${escapeHTML(
                                    item.title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    item.type
                                )}
                            </span>

                        </div>

                        <button
                            class="library-open"
                            data-library-id="${item.id}"
                        >
                            Open
                        </button>

                    </div>

                `
            )
            .join("");


    container
        .querySelectorAll(
            "[data-library-id]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.libraryId
                        );

                    const item =
                        StudyMate.library.find(
                            entry =>
                                entry.id === id
                        );

                    if (!item) return;


                    const preview =
                        document.querySelector(
                            "#libraryPreview"
                        );


                    if (preview) {

                        preview.innerHTML = `
                            <div class="library-preview-content">

                                <h3>
                                    ${escapeHTML(
                                        item.title
                                    )}
                                </h3>

                                <p class="library-preview-type">
                                    ${escapeHTML(
                                        item.type
                                    )}
                                </p>

                                <div class="library-preview-body">
                                    ${formatText(
                                        item.content
                                    )}
                                </div>

                            </div>
                        `;

                    }

                }
            );

        });

}


function getLibraryIcon(type) {

    const normalized =
        String(type || "")
            .toLowerCase();


    if (
        normalized === "pdf"
    ) {
        return "📕";
    }


    if (
        normalized === "word" ||
        normalized === "docx"
    ) {
        return "📘";
    }


    if (
        normalized === "ppt" ||
        normalized === "pptx" ||
        normalized === "powerpoint"
    ) {
        return "📊";
    }


    if (
        normalized === "excel" ||
        normalized === "xlsx"
    ) {
        return "📗";
    }


    return "📝";

}


/* =========================================================
   DOCUMENT STUDIO
   ========================================================= */

function setupDocumentStudio() {

    const createButtons =
        document.querySelectorAll(
            "[data-create-document]"
        );


    createButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const format =
                        button.dataset.createDocument;

                    openDocumentGenerator(
                        format
                    );

                }
            );

        }
    );

}


function openDocumentGenerator(
    format
) {

    const preview =
        document.querySelector(
            "#documentPreview"
        );


    if (!preview) return;


    const formatNames = {

        pdf: "PDF",

        word: "Word",

        docx: "Word",

        ppt: "PowerPoint",

        pptx: "PowerPoint",

        powerpoint: "PowerPoint",

        excel: "Excel",

        xlsx: "Excel"

    };


    const displayName =
        formatNames[format] ||
        format;


    preview.innerHTML = `

        <div class="document-generator">

            <div class="document-generator-header">

                <div>

                    <span class="document-generator-kicker">
                        StudyMate Document Studio
                    </span>

                    <h3>
                        Create ${escapeHTML(
                            displayName
                        )}
                    </h3>

                    <p>
                        Tell StudyMate what you want to create.
                    </p>

                </div>

                <button
                    type="button"
                    class="document-close-btn"
                    id="closeDocumentGenerator"
                >
                    ×
                </button>

            </div>


            <textarea
                id="documentPrompt"
                class="document-prompt"
                placeholder="Example: Create detailed DBMS exam notes with definitions, examples, important points and a short revision section."
            ></textarea>


            <div class="document-generator-actions">

                <button
                    type="button"
                    class="secondary-btn"
                    id="cancelDocumentGeneration"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="primary-btn"
                    id="generateDocumentBtn"
                    data-format="${escapeHTML(
                        format
                    )}"
                >
                    Generate ${escapeHTML(
                        displayName
                    )}
                </button>

            </div>

        </div>

    `;


    const closeButton =
        document.querySelector(
            "#closeDocumentGenerator"
        );


    const cancelButton =
        document.querySelector(
            "#cancelDocumentGeneration"
        );


    const promptInput =
        document.querySelector(
            "#documentPrompt"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                preview.innerHTML = `
                    <div class="document-empty-state">
                        <div class="empty-icon">📄</div>
                        <h3>
                            Document Studio
                        </h3>
                        <p>
                            Choose a format to create
                            your study material.
                        </p>
                    </div>
                `;

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                preview.innerHTML = `
                    <div class="document-empty-state">
                        <div class="empty-icon">📄</div>
                        <h3>
                            Document Studio
                        </h3>
                        <p>
                            Choose a format to create
                            your study material.
                        </p>
                    </div>
                `;

            }
        );

    }


    const generateButton =
        document.querySelector(
            "#generateDocumentBtn"
        );


    if (generateButton) {

        generateButton.addEventListener(
            "click",
            async () => {

                const prompt =
                    promptInput
                        ? promptInput.value.trim()
                        : "";


                if (!prompt) {

                    showToast(
                        "Tell me what to create first."
                    );

                    return;

                }


                await generateStudyMateDocument(
                    format,
                    prompt,
                    generateButton
                );

            }
        );

    }


    if (promptInput) {

        promptInput.focus();


        promptInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    event.ctrlKey
                ) {

                    event.preventDefault();

                    generateButton?.click();

                }

            }
        );

    }

}


/* =========================================================
   DOCUMENT GENERATION
   ========================================================= */

async function generateStudyMateDocument(
    format,
    prompt,
    button
) {

    const originalText =
        button.innerHTML;


    button.disabled = true;

    button.innerHTML =
        "Generating...";


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
                        prompt
                    })
                }
            );


        if (!response.ok) {

            let errorMessage =
                "Document generation failed.";

            try {

                const errorData =
                    await response.json();

                if (
                    errorData &&
                    errorData.error
                ) {

                    errorMessage =
                        errorData.error;

                }

            } catch {
                // Keep default error message.
            }


            throw new Error(
                errorMessage
            );

        }


        const blob =
            await response.blob();


        const contentDisposition =
            response.headers.get(
                "Content-Disposition"
            );


        let filename =
            `StudyMate-${format}`;


        if (contentDisposition) {

            const match =
                contentDisposition.match(
                    /filename="?([^"]+)"?/i
                );


            if (match && match[1]) {

                filename =
                    match[1];

            }

        }


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;
        link.download = filename;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );


        showToast(
            `${format.toUpperCase()} created successfully!`
        );


        addLibraryItem(
            filename,
            format,
            prompt
        );


    } catch (error) {

        console.error(
            "Document generation error:",
            error
        );


        showToast(
            error.message ||
            "Could not generate document."
        );


    } finally {

        button.disabled = false;

        button.innerHTML =
            originalText;

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


                    handleQuickAction(
                        action
                    );

                }
            );

        });

}


function handleQuickAction(
    action
) {

    switch (action) {

        case "tutor":

            navigateTo(
                "tutor"
            );

            break;


        case "notes":

            navigateTo(
                "notes"
            );

            break;


        case "quiz":

            navigateTo(
                "quiz"
            );

            break;


        case "planner":

            navigateTo(
                "planner"
            );

            break;


        case "documents":

            navigateTo(
                "documents"
            );

            break;


        case "library":

            navigateTo(
                "library"
            );

            break;


        default:

            console.log(
                "Unknown quick action:",
                action
            );

    }

}


/* =========================================================
   COMMAND PALETTE
   ========================================================= */

function setupCommandPalette() {

    const palette =
        document.querySelector(
            "#commandPalette"
        );


    const input =
        document.querySelector(
            "#commandInput"
        );


    const openButton =
        document.querySelector(
            "#commandButton"
        );


    const closeButton =
        document.querySelector(
            "#closeCommandPalette"
        );


    if (!palette) return;


    function openPalette() {

        palette.classList.add(
            "open"
        );


        if (input) {
            input.focus();
        }

    }


    function closePalette() {

        palette.classList.remove(
            "open"
        );

    }


    if (openButton) {

        openButton.addEventListener(
            "click",
            openPalette
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePalette
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                    "k"
            ) {

                event.preventDefault();

                openPalette();

            }


            if (
                event.key === "Escape"
            ) {

                closePalette();

            }

        }
    );


    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Enter"
                ) {
                    return;
                }


                const query =
                    input.value
                        .trim()
                        .toLowerCase();


                if (!query) return;


                const commands = {

                    tutor:
                        "tutor",

                    ai:
                        "tutor",

                    notes:
                        "notes",

                    summary:
                        "notes",

                    quiz:
                        "quiz",

                    planner:
                        "planner",

                    tasks:
                        "planner",

                    documents:
                        "documents",

                    document:
                        "documents",

                    library:
                        "library"

                };


                const target =
                    commands[query];


                if (target) {

                    closePalette();

                    navigateTo(
                        target
                    );

                    input.value = "";

                }

            }
        );

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function navigateTo(
    sectionId
) {

    const navItem =
        document.querySelector(
            `[data-section="${sectionId}"]`
        );


    if (navItem) {

        navItem.click();

        return;

    }


    const section =
        document.getElementById(
            sectionId
        );


    if (!section) return;


    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(page => {

            page.classList.remove(
                "active"
            );

        });


    section.classList.add(
        "active"
    );

}


/* =========================================================
   USER INTERFACE
   ========================================================= */

function updateUserInterface() {

    const email =
        StudyMate.user.email;


    const role =
        StudyMate.user.role;


    document
        .querySelectorAll(
            "[data-user-email]"
        )
        .forEach(element => {

            element.textContent =
                email || "Student";

        });


    document
        .querySelectorAll(
            "[data-user-role]"
        )
        .forEach(element => {

            element.textContent =
                role || "Student";

        });

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const totalTasks =
        StudyMate.tasks.length;


    const completedTasks =
        StudyMate.tasks.filter(
            task => task.completed
        ).length;


    document
        .querySelectorAll(
            "[data-total-tasks]"
        )
        .forEach(element => {

            element.textContent =
                totalTasks;

        });


    document
        .querySelectorAll(
            "[data-completed-tasks]"
        )
        .forEach(element => {

            element.textContent =
                completedTasks;

        });


    document
        .querySelectorAll(
            "[data-library-count]"
        )
        .forEach(element => {

            element.textContent =
                StudyMate.library.length;

        });

}


/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function formatText(text) {

    return escapeHTML(
        text || ""
    )
        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        )
        .replace(
            /\n/g,
            "<br>"
        );

}


function showToast(
    message
) {

    let toast =
        document.querySelector(
            "#studyMateToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "studyMateToast";

        toast.className =
            "studymate-toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2600
        );

}


/* =========================================================
   TIMER
   ========================================================= */

function setupTimer() {

    const startButton =
        document.querySelector(
            "#timerStart"
        );


    const pauseButton =
        document.querySelector(
            "#timerPause"
        );


    const resetButton =
        document.querySelector(
            "#timerReset"
        );


    const modeButtons =
        document.querySelectorAll(
            "[data-timer-mode]"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            startTimer
        );

    }


    if (pauseButton) {

        pauseButton.addEventListener(
            "click",
            pauseTimer
        );

    }


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetTimer
        );

    }


    modeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setTimerMode(
                        button.dataset.timerMode
                    );

                }
            );

        }
    );


    updateTimerDisplay();

}


function setTimerMode(
    mode
) {

    const durations = {

        focus:
            25 * 60,

        short:
            5 * 60,

        long:
            15 * 60

    };


    if (
        !durations[mode]
    ) {
        return;
    }


    pauseTimer();


    StudyMate.timer.mode =
        mode;


    StudyMate.timer.duration =
        durations[mode];


    StudyMate.timer.remaining =
        durations[mode];


    document
        .querySelectorAll(
            "[data-timer-mode]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.timerMode ===
                    mode
            );

        });


    updateTimerDisplay();

}


function startTimer() {

    if (
        StudyMate.timer.running
    ) {
        return;
    }


    StudyMate.timer.running =
        true;


    StudyMate.timer.interval =
        setInterval(
            () => {

                StudyMate.timer.remaining--;

                updateTimerDisplay();


                if (
                    StudyMate.timer.remaining <=
                    0
                ) {

                    completeTimer();

                }

            },
            1000
        );


    showToast(
        "Focus session started! 🔥"
    );

}


function pauseTimer() {

    StudyMate.timer.running =
        false;


    if (
        StudyMate.timer.interval
    ) {

        clearInterval(
            StudyMate.timer.interval
        );

        StudyMate.timer.interval =
            null;

    }

}


function resetTimer() {

    pauseTimer();


    StudyMate.timer.remaining =
        StudyMate.timer.duration;


    updateTimerDisplay();


    showToast(
        "Timer reset."
    );

}


function completeTimer() {

    pauseTimer();


    StudyMate.timer.remaining =
        StudyMate.timer.duration;


    updateTimerDisplay();


    showToast(
        "Session complete! 🎉 Take a short break."
    );

}


function updateTimerDisplay() {

    const minutes =
        Math.floor(
            StudyMate.timer.remaining /
                60
        );


    const seconds =
        StudyMate.timer.remaining %
        60;


    const display =
        `${String(minutes).padStart(2, "0")}:${String(
            seconds
        ).padStart(2, "0")}`;


    document
        .querySelectorAll(
            "[data-timer-display]"
        )
        .forEach(element => {

            element.textContent =
                display;

        });


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

    }

}


/* =========================================================
   ONBOARDING
   ========================================================= */

function setupOnboarding() {

    const onboarding =
        document.querySelector(
            "#onboarding"
        );


    if (!onboarding) return;


    const form =
        onboarding.querySelector(
            "form"
        );


    const roleButtons =
        onboarding.querySelectorAll(
            "[data-role]"
        );


    roleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    roleButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    StudyMate.user.role =
                        button.dataset.role;


                    localStorage.setItem(
                        "studymate_role",
                        StudyMate.user.role
                    );

                }
            );

        }
    );


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const emailInput =
                    onboarding.querySelector(
                        "[name='email']"
                    );


                const email =
                    emailInput
                        ? emailInput.value.trim()
                        : "";


                if (!email) {

                    showToast(
                        "Enter your email first."
                    );

                    return;

                }


                StudyMate.user.email =
                    email;


                localStorage.setItem(
                    "studymate_email",
                    email
                );


                localStorage.setItem(
                    "studymate_onboarded",
                    "true"
                );


                onboarding.classList.remove(
                    "open"
                );


                updateUserInterface();


                showToast(
                    "Welcome to StudyMate! 👋"
                );

            }
        );

    }

}
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

    const container = document.querySelector("#taskList");
    if (!container) return;

    if (!StudyMate.tasks.length) {
        container.innerHTML = `
            <div class="empty-state">
                No study tasks yet.<br>
                Add one above.
            </div>`;
        return;
    }

    container.innerHTML = StudyMate.tasks.map(task => `
        <div class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
            <label class="task-check">
                <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.completed ? "checked" : ""}>
                <span>${escapeHTML(task.title)}</span>
            </label>
            <span class="task-subject">${escapeHTML(task.subject || "General")}</span>
            <button type="button" class="task-delete" data-task-delete="${task.id}" aria-label="Delete task">×</button>
        </div>
    `).join("");

    container.querySelectorAll("[data-task-id].task-checkbox").forEach(input => {
        input.addEventListener("change", () => {
            const id = Number(input.dataset.taskId);
            const task = StudyMate.tasks.find(item => item.id === id);
            if (!task) return;
            task.completed = input.checked;
            saveTasks();
            renderTasks();
            updateDashboard();
        });
    });

    container.querySelectorAll("[data-task-delete]").forEach(button => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.taskDelete);
            StudyMate.tasks = StudyMate.tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateDashboard();
            showToast("Task deleted.");
        });
    });
}

/* =========================================================
   FOCUS TIMER
   ========================================================= */
function setupTimer() {
    document.querySelectorAll("[data-timer-mode]").forEach(button => {
        button.addEventListener("click", () => {
            const mode = button.dataset.timerMode;
            if (!mode) return;
            StudyMate.timer.mode = mode;
            StudyMate.timer.duration = mode === "break" ? 5 * 60 : 25 * 60;
            StudyMate.timer.remaining = StudyMate.timer.duration;
            stopTimer();
            updateTimerDisplay();
            document.querySelectorAll("[data-timer-mode]").forEach(item => item.classList.remove("active"));
            button.classList.add("active");
        });
    });

    document.querySelector("#timerStartBtn")?.addEventListener("click", toggleTimer);
    document.querySelector("#startTimerBtn")?.addEventListener("click", toggleTimer);
    document.querySelector("#timerResetBtn")?.addEventListener("click", resetTimer);
    document.querySelector("#resetTimerBtn")?.addEventListener("click", resetTimer);
}

function toggleTimer() {
    if (StudyMate.timer.running) stopTimer();
    else startTimer();
}

function startTimer() {
    if (StudyMate.timer.remaining <= 0) resetTimer();
    StudyMate.timer.running = true;
    updateTimerButtons();
    StudyMate.timer.interval = setInterval(() => {
        StudyMate.timer.remaining--;
        updateTimerDisplay();
        if (StudyMate.timer.remaining <= 0) {
            stopTimer();
            showToast(StudyMate.timer.mode === "focus" ? "Focus session complete! 🎉" : "Break complete! 💪");
        }
    }, 1000);
}

function stopTimer() {
    StudyMate.timer.running = false;
    if (StudyMate.timer.interval) clearInterval(StudyMate.timer.interval);
    StudyMate.timer.interval = null;
    updateTimerButtons();
}

function resetTimer() {
    stopTimer();
    StudyMate.timer.remaining = StudyMate.timer.duration;
    updateTimerDisplay();
}

function updateTimerButtons() {
    document.querySelectorAll("#timerStartBtn, #startTimerBtn").forEach(button => {
        button.textContent = StudyMate.timer.running ? "Pause" : "Start";
    });
}

function updateTimerDisplay() {
    const total = StudyMate.timer.duration || 1500;
    const remaining = Math.max(0, StudyMate.timer.remaining);
    const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
    const seconds = (remaining % 60).toString().padStart(2, "0");
    document.querySelectorAll("[data-timer-display], #timerDisplay").forEach(el => {
        el.textContent = `${minutes}:${seconds}`;
    });
    const progress = document.querySelector("[data-timer-progress], #timerProgress");
    if (progress) {
        const percent = Math.max(0, Math.min(100, (remaining / total) * 100));
        progress.style.setProperty("--progress", `${percent}%`);
        if (progress.tagName === "PROGRESS") progress.value = percent;
    }
}

/* =========================================================
   LIBRARY
   ========================================================= */
function setupLibrary() {
    document.querySelector("#clearLibraryBtn")?.addEventListener("click", () => {
        StudyMate.library = [];
        saveLibrary();
        renderLibrary();
        showToast("Library cleared.");
    });
}

function saveLibrary() {
    localStorage.setItem("studymate_library", JSON.stringify(StudyMate.library));
}

function renderLibrary() {
    const container = document.querySelector("#libraryList");
    if (!container) return;
    if (!StudyMate.library.length) {
        container.innerHTML = `<div class="empty-state">Your saved study materials will appear here.</div>`;
        return;
    }
    container.innerHTML = StudyMate.library.map(item => `
        <div class="library-item">
            <div>
                <strong>${escapeHTML(item.title || "Study Material")}</strong>
                <p>${escapeHTML(item.type || "Document")}</p>
            </div>
        </div>
    `).join("");
}

/* =========================================================
   DOCUMENT STUDIO
   PDF + WORD + POWERPOINT + EXCEL
   ========================================================= */
function setupDocumentStudio() {
    addDocumentStudioStyles();

    document.querySelectorAll("[data-create-document]").forEach(button => {
        button.addEventListener("click", () => {
            openDocumentGenerator(button.dataset.createDocument || "pdf");
        });
    });
}

function openDocumentGenerator(type) {
    const formats = {
        pdf: { format: "pdf", title: "PDF", extension: "pdf", icon: "📄" },
        word: { format: "word", title: "Word Document", extension: "docx", icon: "📝" },
        docx: { format: "word", title: "Word Document", extension: "docx", icon: "📝" },
        ppt: { format: "pptx", title: "PowerPoint", extension: "pptx", icon: "📊" },
        pptx: { format: "pptx", title: "PowerPoint", extension: "pptx", icon: "📊" },
        powerpoint: { format: "pptx", title: "PowerPoint", extension: "pptx", icon: "📊" },
        excel: { format: "xlsx", title: "Excel Workbook", extension: "xlsx", icon: "📈" },
        xlsx: { format: "xlsx", title: "Excel Workbook", extension: "xlsx", icon: "📈" }
    };

    const selected = formats[type] || formats.pdf;
    let preview = document.querySelector("#documentPreview");

    if (!preview) {
        const studio = document.querySelector("[data-create-document]")?.closest(".view") ||
            document.querySelector("#documents") ||
            document.querySelector("#document-studio");

        if (!studio) {
            showToast("Document Studio section was not found.");
            return;
        }

        preview = document.createElement("div");
        preview.id = "documentPreview";
        studio.appendChild(preview);
    }

    preview.innerHTML = `
        <div class="studymate-document-generator">
            <div class="document-generator-header">
                <div class="document-generator-icon">${selected.icon}</div>
                <div>
                    <h2>Create ${selected.title}</h2>
                    <p>Tell StudyMate exactly what you want to create.</p>
                </div>
            </div>

            <div class="document-prompt-wrapper">
                <textarea
                    id="documentPrompt"
                    class="document-prompt"
                    rows="8"
                    placeholder="Ask StudyMate to create something...\n\nExample: Create detailed BTech CSE notes on DBMS normalization. Include definitions, 1NF, 2NF, 3NF, BCNF, examples, advantages and last-minute exam revision points."></textarea>

                <div class="document-prompt-footer">
                    <span class="document-format-label">${selected.icon} ${selected.title}</span>
                    <button type="button" id="generateDocumentBtn" class="document-generate-btn">
                        Generate ${selected.title}
                    </button>
                </div>
            </div>

            <div id="documentGenerationStatus" class="document-generation-status"></div>
        </div>
    `;

    const prompt = document.querySelector("#documentPrompt");
    const button = document.querySelector("#generateDocumentBtn");

    setTimeout(() => prompt?.focus(), 100);

    button?.addEventListener("click", () => {
        generateStudyMateDocument(selected.format, selected.extension, selected.title);
    });

    prompt?.addEventListener("keydown", event => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            generateStudyMateDocument(selected.format, selected.extension, selected.title);
        }
    });

    preview.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function generateStudyMateDocument(format, extension, title) {
    const input = document.querySelector("#documentPrompt");
    const button = document.querySelector("#generateDocumentBtn");
    const status = document.querySelector("#documentGenerationStatus");

    const prompt = input?.value.trim() || "";

    if (!prompt) {
        showToast("First tell StudyMate what you want to create.");
        input?.focus();
        return;
    }

    if (button) {
        button.disabled = true;
        button.innerHTML = `<span class="document-loader"></span> Creating ${title}...`;
    }

    if (status) {
        status.className = "document-generation-status generating";
        status.innerHTML = `
            <strong>StudyMate AI is working ✨</strong>
            <span>Creating your ${escapeHTML(title)}. Please wait...</span>
        `;
    }

    try {
        const response = await fetch(`${STUDYMATE_BACKEND}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ format, prompt })
        });

        if (!response.ok) {
            let message = "";
            try {
                const data = await response.json();
                message = data.error || data.message || "";
            } catch (_) {}
            throw new Error(message || `Generation failed (${response.status})`);
        }

        const blob = await response.blob();

        if (!blob || blob.size === 0) {
            throw new Error("The backend returned an empty file.");
        }

        const disposition = response.headers.get("Content-Disposition") || "";
        const match = disposition.match(/filename\*?=(?:UTF-8''|\")?([^\";\n]+)/i);
        let filename = match
            ? decodeURIComponent(match[1].replace(/"/g, "").trim())
            : `StudyMate-${Date.now()}.${extension}`;

        if (!filename.toLowerCase().endsWith(`.${extension}`)) {
            filename += `.${extension}`;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        if (status) {
            status.className = "document-generation-status success";
            status.innerHTML = `
                <strong>✓ ${escapeHTML(title)} created successfully</strong>
                <span>${escapeHTML(filename)} has been downloaded.</span>
            `;
        }

        showToast(`${title} created successfully! 🎉`);

    } catch (error) {
        console.error("StudyMate Document Studio error:", error);

        if (status) {
            status.className = "document-generation-status error";
            status.innerHTML = `
                <strong>Could not create the file</strong>
                <span>${escapeHTML(error.message || "Backend connection failed.")}</span>
            `;
        }

        showToast("Document generation failed. Check that the backend is running.");

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = `Generate ${title}`;
        }
    }
}

function addDocumentStudioStyles() {
    if (document.querySelector("#studymate-document-styles")) return;

    const style = document.createElement("style");
    style.id = "studymate-document-styles";
    style.textContent = `
        #documentPreview { width: 100%; margin-top: 24px; }
        .studymate-document-generator {
            width: 100%; max-width: 900px; margin: 0 auto; padding: 26px;
            border-radius: 24px; background: rgba(255,255,255,.97);
            border: 1px solid rgba(124,58,237,.15);
            box-shadow: 0 18px 60px rgba(60,40,120,.10);
            box-sizing: border-box;
        }
        .document-generator-header { display:flex; gap:15px; align-items:center; margin-bottom:20px; }
        .document-generator-icon {
            width:52px; height:52px; min-width:52px; display:grid; place-items:center;
            border-radius:16px; font-size:25px;
            background:linear-gradient(135deg,rgba(124,58,237,.13),rgba(20,184,166,.13));
        }
        .document-generator-header h2 { margin:0 0 5px; font-size:21px; }
        .document-generator-header p { margin:0; opacity:.65; font-size:14px; }
        .document-prompt-wrapper {
            overflow:hidden; border-radius:20px; border:1.5px solid rgba(124,58,237,.22);
            background:#fff; box-shadow:0 8px 28px rgba(124,58,237,.08);
        }
        .document-prompt-wrapper:focus-within {
            border-color:rgba(124,58,237,.75); box-shadow:0 10px 32px rgba(124,58,237,.15);
        }
        .document-prompt {
            display:block; width:100%; min-height:180px; resize:vertical; padding:20px;
            border:0; outline:0; background:transparent; color:#191927;
            font:inherit; font-size:15px; line-height:1.65; box-sizing:border-box;
        }
        .document-prompt::placeholder { color:#9794a5; }
        .document-prompt-footer {
            display:flex; justify-content:space-between; align-items:center; gap:12px;
            padding:12px; border-top:1px solid rgba(0,0,0,.06);
        }
        .document-format-label { font-size:13px; font-weight:600; opacity:.7; padding-left:7px; }
        .document-generate-btn {
            border:0; outline:0; cursor:pointer; min-height:44px; padding:0 20px;
            border-radius:14px; color:#fff; font:inherit; font-weight:700; font-size:14px;
            background:linear-gradient(135deg,#7c3aed,#14b8a6);
            box-shadow:0 8px 22px rgba(124,58,237,.20);
        }
        .document-generate-btn:disabled { cursor:wait; opacity:.65; }
        .document-generation-status { display:none; margin-top:15px; padding:14px 16px; border-radius:14px; font-size:13px; }
        .document-generation-status strong,.document-generation-status span { display:block; }
        .document-generation-status span { margin-top:4px; opacity:.78; }
        .document-generation-status.generating,.document-generation-status.success,.document-generation-status.error { display:block; }
        .document-generation-status.generating { background:rgba(124,58,237,.08); }
        .document-generation-status.success { background:rgba(16,185,129,.10); }
        .document-generation-status.error { background:rgba(239,68,68,.10); }
        .document-loader {
            display:inline-block; width:14px; height:14px; margin-right:7px; vertical-align:-2px;
            border-radius:50%; border:2px solid rgba(255,255,255,.4); border-top-color:#fff;
            animation:documentSpin .7s linear infinite;
        }
        @keyframes documentSpin { to { transform:rotate(360deg); } }
        @media(max-width:600px) {
            .studymate-document-generator { padding:18px; border-radius:18px; }
            .document-prompt-footer { flex-direction:column; align-items:stretch; }
            .document-generate-btn { width:100%; }
        }
    `;
    document.head.appendChild(style);
}

/* =========================================================
   QUICK ACTIONS / COMMAND PALETTE
   ========================================================= */
function setupQuickActions() {
    document.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;
            if (action === "timer") showView("timer");
            if (action === "planner") showView("planner");
            if (action === "notes") showView("notes");
            if (action === "quiz") showView("quiz");
            if (action === "documents") showView("documents");
            if (action === "chat") showView("chat");
        });
    });
}

function setupCommandPalette() {
    const palette = document.querySelector("#commandPalette");
    const input = document.querySelector("#commandInput");
    document.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            palette?.classList.toggle("hidden");
            input?.focus();
        }
        if (event.key === "Escape") palette?.classList.add("hidden");
    });
    input?.addEventListener("input", () => {
        const query = input.value.toLowerCase().trim();
        palette?.querySelectorAll("[data-command]").forEach(item => {
            item.style.display = !query || item.textContent.toLowerCase().includes(query) ? "" : "none";
        });
    });
    palette?.querySelectorAll("[data-command]").forEach(item => {
        item.addEventListener("click", () => {
            showView(item.dataset.command);
            palette.classList.add("hidden");
        });
    });
}

/* =========================================================
   DASHBOARD
   ========================================================= */
function updateDashboard() {
    const total = StudyMate.tasks.length;
    const completed = StudyMate.tasks.filter(task => task.completed).length;
    document.querySelectorAll("[data-task-count]").forEach(el => el.textContent = total);
    document.querySelectorAll("[data-completed-count]").forEach(el => el.textContent = completed);
    document.querySelectorAll("[data-progress]").forEach(el => {
        const value = total ? Math.round((completed / total) * 100) : 0;
        el.textContent = `${value}%`;
        if (el.tagName === "PROGRESS") el.value = value;
    });
}

/* =========================================================
   UTILITIES
   ========================================================= */
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatText(text) {
    return escapeHTML(text)
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/^• (.+)$/gm, "<div class=\"bullet-line\">• $1</div>")
        .replace(/\n/g, "<br>");
}

function showToast(message) {
    let toast = document.querySelector("#studyMateToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "studyMateToast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

console.log("StudyMate loaded successfully.");
