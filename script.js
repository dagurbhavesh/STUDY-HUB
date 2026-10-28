// ==========================================
// STUDYHUB
// ==========================================

// ================================
// ELEMENTS
// ================================

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");
const goButtons = document.querySelectorAll("[data-go]");

// Tasks
const taskInput = document.getElementById("taskInput");
const taskSubject = document.getElementById("taskSubject");
const prioritySelect = document.getElementById("prioritySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const dashboardTasks = document.getElementById("dashboardTasks");

// Notes
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const notesList = document.getElementById("notesList");

// Stats
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");
const streakCount = document.getElementById("streakCount");
const sidebarStreak = document.getElementById("sidebarStreak");
const sessionCount = document.getElementById("sessionCount");

// Other
const currentDate = document.getElementById("currentDate");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

// Smart Planner
const subjectSelect = document.getElementById("subjectSelect");
const loadPlanBtn = document.getElementById("loadPlanBtn");
const addPlanBtn = document.getElementById("addPlanBtn");
const studyPlan = document.getElementById("studyPlan");

// Timer
const timerDisplay = document.getElementById("timer");
const startTimer = document.getElementById("startTimer");
const resetTimer = document.getElementById("resetTimer");

// AI
const aiButton = document.getElementById("aiButton");
const aiPanel = document.getElementById("aiPanel");
const closeAI = document.getElementById("closeAI");
const aiInput = document.getElementById("aiInput");
const sendAI = document.getElementById("sendAI");
const aiMessages = document.getElementById("aiMessages");

// ================================
// DATA
// ================================

let tasks =
    JSON.parse(localStorage.getItem("studyhubTasks")) || [];

let notes =
    JSON.parse(localStorage.getItem("studyhubNotes")) || [];

let sessions =
    Number(localStorage.getItem("studyhubSessions")) || 0;


// ================================
// SMART STUDY PLANS
// ================================

const studyPlans = {

    dsa: [
        "Solve 2 Array questions",
        "Revise Two Pointer technique",
        "Solve 1 LeetCode problem",
        "Review mistakes from previous problems"
    ],

    java: [
        "Revise Java OOP concepts",
        "Practice Inheritance",
        "Solve 3 Java coding questions",
        "Revise Exception Handling"
    ],

    python: [
        "Practice Python basics",
        "Revise Lists and Dictionaries",
        "Practice 3 Pandas questions",
        "Write one small Python program"
    ],

    web: [
        "Revise HTML semantic tags",
        "Practice CSS Flexbox/Grid",
        "Build one JavaScript component",
        "Practice DOM manipulation"
    ]
};


// ================================
// DATE
// ================================

function showDate() {

    const date = new Date();

    if (currentDate) {
        currentDate.innerText =
            date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    }
}

showDate();


// ================================
// NAVIGATION
// ================================

navItems.forEach(function(button) {

    button.addEventListener("click", function() {

        openSection(button.dataset.section);

    });

});


goButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        openSection(button.dataset.go);

    });

});


function openSection(sectionName) {

    navItems.forEach(function(item) {

        item.classList.remove("active");

        if (item.dataset.section === sectionName) {
            item.classList.add("active");
        }

    });


    sections.forEach(function(section) {

        section.classList.remove("active-section");

        if (section.id === sectionName) {
            section.classList.add("active-section");
        }

    });

}


// ================================
// SMART PLANNER
// ================================

function showStudyPlan() {

    if (!subjectSelect || !studyPlan) {
        return;
    }

    const subject = subjectSelect.value;
    const plan = studyPlans[subject];

    studyPlan.innerHTML = "";

    plan.forEach(function(item, index) {

        const div = document.createElement("div");

        div.className = "plan-task";

        div.innerHTML = `
            <div class="plan-number">
                ${index + 1}
            </div>

            <span>
                ${escapeHTML(item)}
            </span>
        `;

        studyPlan.appendChild(div);

    });

}


if (loadPlanBtn) {

    loadPlanBtn.addEventListener(
        "click",
        showStudyPlan
    );

}


// ================================
// ADD TODAY'S PLAN
// ================================

if (addPlanBtn) {

    addPlanBtn.addEventListener(
        "click",
        function() {

            const subject = subjectSelect.value;
            const plan = studyPlans[subject];

            const subjectName =
                subjectSelect.selectedOptions[0].textContent.trim();

            plan.forEach(function(item) {

                const task = {

                    id:
                        Date.now() +
                        Math.random(),

                    text:
                        subjectName +
                        " — " +
                        item,

                    subject:
                        subject,

                    priority:
                        "medium",

                    completed:
                        false

                };

                tasks.push(task);

            });


            saveTasks();

            renderTasks();

            showToast(
                "📚 Today's plan added!"
            );

        }
    );

}


// ================================
// TASKS
// ================================

if (addTaskBtn) {

    addTaskBtn.addEventListener(
        "click",
        addTask
    );

}


if (taskInput) {

    taskInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {
                addTask();
            }

        }
    );

}


function addTask() {

    const text =
        taskInput.value.trim();


    if (text === "") {

        showToast(
            "Please enter a task."
        );

        return;
    }


    const task = {

        id:
            Date.now(),

        text:
            text,

        subject:
            taskSubject
                ? taskSubject.value
                : "general",

        priority:
            prioritySelect.value,

        completed:
            false
    };


    tasks.unshift(task);

    saveTasks();

    taskInput.value = "";

    renderTasks();

    showToast(
        "Task added successfully!"
    );

}


// ================================
// MIGRATE OLD TASKS
// ================================

function migrateOldTasks() {

    let changed = false;

    tasks = tasks.map(function(task) {

        if (task.subject) {
            return task;
        }

        const text =
            task.text.toLowerCase();

        let subject = "general";


        if (
            text.includes("dsa") ||
            text.includes("array") ||
            text.includes("leetcode") ||
            text.includes("two pointer")
        ) {

            subject = "dsa";

        } else if (
            text.includes("java") ||
            text.includes("oop") ||
            text.includes("inheritance")
        ) {

            subject = "java";

        } else if (
            text.includes("python") ||
            text.includes("pandas")
        ) {

            subject = "python";

        } else if (
            text.includes("javascript") ||
            text.includes("react") ||
            text.includes("css") ||
            text.includes("html") ||
            text.includes("dom")
        ) {

            subject = "web";

        }


        changed = true;

        return {
            ...task,
            subject: subject
        };

    });


    if (changed) {
        saveTasks();
    }

}


// ================================
// SAVE TASKS
// ================================

function saveTasks() {

    localStorage.setItem(
        "studyhubTasks",
        JSON.stringify(tasks)
    );

}


// ================================
// RENDER TASKS
// ================================

function renderTasks() {

    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";


    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">

                <span>✨</span>

                <p>
                    Your task list is empty
                </p>

                <small>
                    Add something you want
                    to finish today.
                </small>

            </div>
        `;

    } else {

        tasks.forEach(function(task) {

            const item =
                document.createElement("div");


            item.className =
                "task-item" +
                (
                    task.completed
                    ? " completed"
                    : ""
                );


            item.innerHTML = `

                <div class="task-check">

                    ${
                        task.completed
                        ? "✓"
                        : ""
                    }

                </div>

                <div class="task-name">

                    ${escapeHTML(task.text)}

                </div>

                <span
                    class="
                    priority
                    priority-${task.priority}
                    "
                >
                    ${task.priority}
                </span>

                <button
                    class="delete-task"
                >
                    ×
                </button>
            `;


            item.querySelector(
                ".task-check"
            ).addEventListener(
                "click",
                function() {

                    toggleTask(task.id);

                }
            );


            item.querySelector(
                ".delete-task"
            ).addEventListener(
                "click",
                function() {

                    deleteTask(task.id);

                }
            );


            taskList.appendChild(item);

        });

    }


    renderDashboardTasks();

    updateStats();

    updateLearningProgress();

}


// ================================
// TOGGLE TASK
// ================================

function toggleTask(id) {

    tasks =
        tasks.map(function(task) {

            if (task.id === id) {

                return {

                    ...task,

                    completed:
                        !task.completed

                };

            }

            return task;

        });


    saveTasks();

    renderTasks();

    showToast(
        "Task updated!"
    );

}


// ================================
// DELETE TASK
// ================================

function deleteTask(id) {

    tasks =
        tasks.filter(function(task) {

            return task.id !== id;

        });


    saveTasks();

    renderTasks();

    showToast(
        "Task deleted."
    );

}
// ================================
// DASHBOARD TASKS
// ================================

function renderDashboardTasks() {

    if (!dashboardTasks) {
        return;
    }

    dashboardTasks.innerHTML = "";


    if (tasks.length === 0) {

        dashboardTasks.innerHTML = `
            <div class="empty-state">

                <span>🎯</span>

                <p>
                    No tasks yet
                </p>

                <small>
                    Add your first task
                    to get started.
                </small>

            </div>
        `;

        return;
    }


    const preview =
        tasks.slice(0, 4);


    preview.forEach(function(task) {

        const div =
            document.createElement("div");


        div.className =
            "task-item";


        div.innerHTML = `

            <div class="task-check">

                ${
                    task.completed
                    ? "✓"
                    : ""
                }

            </div>

            <div class="task-name">

                ${escapeHTML(task.text)}

            </div>

            <span
                class="
                priority
                priority-${task.priority}
                "
            >
                ${task.priority}
            </span>
        `;


        dashboardTasks.appendChild(div);

    });

}


// ================================
// STATS
// ================================

function updateStats() {

    const completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;


    const remaining =
        tasks.length - completed;


    if (completedCount) {
        completedCount.innerText =
            completed;
    }


    if (remainingCount) {
        remainingCount.innerText =
            remaining;
    }


    if (sessionCount) {
        sessionCount.innerText =
            sessions;
    }


    const streak =
        completed > 0
        ? 1
        : 0;


    if (streakCount) {
        streakCount.innerText =
            streak + " days";
    }


    if (sidebarStreak) {
        sidebarStreak.innerText =
            streak + " Days";
    }

}


// ================================
// REAL LEARNING PROGRESS
// ================================

const progressElements = {

    dsa: {
        value:
            document.getElementById(
                "progress-dsa-value"
            ),

        bar:
            document.getElementById(
                "progress-dsa-bar"
            )
    },

    java: {
        value:
            document.getElementById(
                "progress-java-value"
            ),

        bar:
            document.getElementById(
                "progress-java-bar"
            )
    },

    python: {
        value:
            document.getElementById(
                "progress-python-value"
            ),

        bar:
            document.getElementById(
                "progress-python-bar"
            )
    },

    web: {
        value:
            document.getElementById(
                "progress-web-value"
            ),

        bar:
            document.getElementById(
                "progress-web-bar"
            )
    }

};


function updateLearningProgress() {

    const subjects = [
        "dsa",
        "java",
        "python",
        "web"
    ];


    subjects.forEach(function(subject) {

        const subjectTasks =
            tasks.filter(function(task) {

                return task.subject === subject;

            });


        const total =
            subjectTasks.length;


        const completed =
            subjectTasks.filter(function(task) {

                return task.completed;

            }).length;


        let percentage = 0;


        if (total > 0) {

            percentage =
                Math.round(
                    (completed / total) * 100
                );

        }


        const elements =
            progressElements[subject];


        if (!elements) {
            return;
        }


        if (elements.value) {

            elements.value.innerText =
                percentage + "%";

        }


        if (elements.bar) {

            elements.bar.style.width =
                percentage + "%";

        }

    });

}


// ================================
// NOTES
// ================================

if (saveNoteBtn) {

    saveNoteBtn.addEventListener(
        "click",
        saveNote
    );

}


function saveNote() {

    const title =
        noteTitle.value.trim();

    const content =
        noteContent.value.trim();


    if (
        title === "" ||
        content === ""
    ) {

        showToast(
            "Write a title and note first."
        );

        return;
    }


    const note = {

        id:
            Date.now(),

        title:
            title,

        content:
            content
    };


    notes.unshift(note);


    localStorage.setItem(
        "studyhubNotes",
        JSON.stringify(notes)
    );


    noteTitle.value = "";

    noteContent.value = "";


    renderNotes();

    showToast(
        "Note saved!"
    );

}


// ================================
// RENDER NOTES
// ================================

function renderNotes() {

    if (!notesList) {
        return;
    }

    notesList.innerHTML = "";


    if (notes.length === 0) {

        notesList.innerHTML = `
            <div class="empty-state">

                <span>📝</span>

                <p>
                    No notes yet
                </p>

                <small>
                    Your saved notes
                    will appear here.
                </small>

            </div>
        `;

        return;
    }


    notes.forEach(function(note) {

        const card =
            document.createElement("div");


        card.className =
            "note-card";


        card.innerHTML = `

            <button
                class="delete-note"
            >
                ×
            </button>

            <h3>
                ${escapeHTML(note.title)}
            </h3>

            <p>
                ${escapeHTML(note.content)}
            </p>
        `;


        card.querySelector(
            ".delete-note"
        ).addEventListener(
            "click",
            function() {

                deleteNote(note.id);

            }
        );


        notesList.appendChild(card);

    });

}


// ================================
// DELETE NOTE
// ================================

function deleteNote(id) {

    notes =
        notes.filter(function(note) {

            return note.id !== id;

        });


    localStorage.setItem(
        "studyhubNotes",
        JSON.stringify(notes)
    );


    renderNotes();

    showToast(
        "Note deleted."
    );

}


// ================================
// CUSTOM FOCUS TIMER
// ================================

let selectedMinutes = 25;

let totalSeconds =
    selectedMinutes * 60;

let timerRunning =
    false;

let timerInterval =
    null;


// Timer preset buttons
const timerPresets =
    document.querySelectorAll(
        ".timer-preset"
    );


// Custom timer elements
const customTimerInput =
    document.getElementById(
        "customTimerInput"
    );

const applyCustomTimer =
    document.getElementById(
        "applyCustomTimer"
    );


// ================================
// SET TIMER DURATION
// ================================

function setTimerDuration(minutes) {

    if (
        minutes < 1 ||
        minutes > 180
    ) {

        showToast(
            "Choose a time between 1 and 180 minutes."
        );

        return;
    }


    clearInterval(timerInterval);

    timerRunning = false;

    selectedMinutes = minutes;

    totalSeconds =
        selectedMinutes * 60;


    startTimer.innerText =
        "▶ Start";


    timerPresets.forEach(function(button) {

        button.classList.remove(
            "active"
        );


        if (
            Number(button.dataset.minutes) ===
            minutes
        ) {

            button.classList.add(
                "active"
            );

        }

    });


    updateTimer();

}


// ================================
// PRESET BUTTONS
// ================================

timerPresets.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            const minutes =
                Number(
                    button.dataset.minutes
                );


            setTimerDuration(minutes);

        }
    );

});


// ================================
// CUSTOM TIMER
// ================================

if (applyCustomTimer) {

    applyCustomTimer.addEventListener(
        "click",
        function() {

            const minutes =
                Number(
                    customTimerInput.value
                );


            if (
                !minutes ||
                minutes < 1 ||
                minutes > 180
            ) {

                showToast(
                    "Enter 1–180 minutes."
                );

                return;
            }


            setTimerDuration(minutes);

            showToast(
                minutes +
                " minute timer set!"
            );

        }
    );

}


// ================================
// START / PAUSE TIMER
// ================================

if (startTimer) {

    startTimer.addEventListener(
        "click",
        function() {

            if (timerRunning) {

                pauseTimer();

            } else {

                startTimerFunction();

            }

        }
    );

}


// ================================
// RESET TIMER
// ================================

if (resetTimer) {

    resetTimer.addEventListener(
        "click",
        resetTimerFunction
    );

}


// ================================
// START TIMER
// ================================

function startTimerFunction() {

    if (totalSeconds <= 0) {

        totalSeconds =
            selectedMinutes * 60;

    }


    timerRunning = true;


    startTimer.innerText =
        "⏸ Pause";


    timerInterval =
        setInterval(function() {

            totalSeconds--;

            updateTimer();


            if (totalSeconds <= 0) {

                clearInterval(
                    timerInterval
                );


                timerRunning = false;


                sessions++;


                localStorage.setItem(
                    "studyhubSessions",
                    sessions
                );


                totalSeconds =
                    selectedMinutes * 60;


                startTimer.innerText =
                    "▶ Start";


                updateTimer();

                updateStats();


                showToast(
                    "🎉 Focus session completed!"
                );

            }

        }, 1000);

}


// ================================
// PAUSE TIMER
// ================================

function pauseTimer() {

    clearInterval(
        timerInterval
    );


    timerRunning = false;


    startTimer.innerText =
        "▶ Resume";

}


// ================================
// RESET TIMER
// ================================

function resetTimerFunction() {

    clearInterval(
        timerInterval
    );


    timerRunning = false;


    totalSeconds =
        selectedMinutes * 60;


    startTimer.innerText =
        "▶ Start";


    updateTimer();

}


// ================================
// UPDATE TIMER DISPLAY
// ================================

function updateTimer() {

    if (!timerDisplay) {
        return;
    }


    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    timerDisplay.innerText =

        String(minutes)
            .padStart(2, "0")

        +

        ":"

        +

        String(seconds)
            .padStart(2, "0");

}


// ================================
// THEME
// ================================

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "light"
            );


            if (
                document.body.classList.contains(
                    "light"
                )
            ) {

                themeToggle.innerText =
                    "☀️ Light Mode";

            } else {

                themeToggle.innerText =
                    "🌙 Dark Mode";

            }

        }
    );

}


// ================================
// TOAST
// ================================

let toastTimeout;


function showToast(message) {

    if (!toast) {
        return;
    }


    const toastText =
        toast.querySelector("p");


    if (toastText) {

        toastText.innerText =
            message;

    }


    toast.classList.add("show");


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(function() {

            toast.classList.remove(
                "show"
            );

        }, 2200);

}


// ================================
// SECURITY HELPER
// ================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.innerText =
        String(text);


    return div.innerHTML;

}


// ================================
// AI ASSISTANT
// ================================

if (aiButton) {

    aiButton.addEventListener(
        "click",
        function() {

            aiPanel.classList.add(
                "open"
            );

            aiInput.focus();

        }
    );

}


if (closeAI) {

    closeAI.addEventListener(
        "click",
        function() {

            aiPanel.classList.remove(
                "open"
            );

        }
    );

}


if (sendAI) {

    sendAI.addEventListener(
        "click",
        sendAIMessage
    );

}


if (aiInput) {

    aiInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                sendAIMessage();

            }

        }
    );

}


// ================================
// SEND AI MESSAGE
// ================================

async function sendAIMessage() {

    const message =
        aiInput.value.trim();


    if (message === "") {
        return;
    }


    addAIMessage(
        message,
        "user"
    );


    aiInput.value = "";


    const loading =
        addAIMessage(
            "🤔 Thinking...",
            "bot"
        );


    sendAI.disabled = true;


    try {

        const response =
            await fetch(
                "http://localhost:3000/api/ask",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message: message
                        })

                }
            );


        const data =
            await response.json();


        loading.remove();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "AI request failed"
            );

        }


        addAIMessage(
            data.reply,
            "bot"
        );


    } catch (error) {

        loading.remove();


        console.error(error);


        addAIMessage(
            "❌ AI se connection nahi ho paaya. Check karo ki backend server port 3000 par chal raha hai.",
            "bot"
        );

    }


    sendAI.disabled = false;

    aiInput.focus();

}


// ================================
// ADD AI MESSAGE
// ================================

function addAIMessage(
    message,
    type
) {

    const div =
        document.createElement("div");


    div.className =
        "ai-message " + type;


    div.innerText =
        message;


    aiMessages.appendChild(div);


    aiMessages.scrollTop =
        aiMessages.scrollHeight;


    return div;

}


// ================================
// INITIAL LOAD
// ================================

migrateOldTasks();

renderTasks();

renderNotes();

updateTimer();

updateStats();

updateLearningProgress();

showStudyPlan();


// ================================
// READY
// ================================

console.log(
    "🚀 StudyHub is ready!"
);