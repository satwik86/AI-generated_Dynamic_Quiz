document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const startBtn = document.getElementById("start-btn");
    const nextBtn = document.getElementById("next-btn");
    const restartBtn = document.getElementById("restart-btn");
    const setupContainer = document.getElementById("setup-container");
    const loadingContainer = document.getElementById("loading-container");
    const questionContainer = document.getElementById("question-container");
    const questionText = document.getElementById("question-text");
    const choicesList = document.getElementById("choices-list");
    const resultContainer = document.getElementById("result-container");
    const scoreDisplay = document.getElementById("score");

    // Timer Elements
    const timerBar = document.getElementById("timer-bar");
    const timerText = document.getElementById("timer-text");

    // Input Elements
    const topicInput = document.getElementById("topic-input");
    const difficultyInput = document.getElementById("difficulty-input");
    const countInput = document.getElementById("count-input");

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let timeLeft = 15;

    startBtn.addEventListener("click", startQuiz);

    nextBtn.addEventListener("click", () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    });

    restartBtn.addEventListener("click", () => {
        location.reload(); // Refreshing is cleaner for a full reset
    });

    async function fetchAIQuestions(topic, difficulty, count) {
        try {
            const response = await fetch('http://localhost:3000/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, difficulty, count })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Server failed to respond");
            }
            return await response.json(); 
        } catch (error) {
            console.error("Fetch Error:", error.message);
            alert("⚠️ Error: " + error.message);
            return null;
        }
    }

    async function startQuiz() {
        const topic = topicInput.value.trim();
        const difficulty = difficultyInput.value;
        const count = countInput.value;

        if (!topic) return alert("Please enter a topic first!");

        setupContainer.classList.add("hidden");
        loadingContainer.classList.remove("hidden");

        const data = await fetchAIQuestions(topic, difficulty, count);

        loadingContainer.classList.add("hidden");

        if (data && data.length > 0) {
            questions = data;
            questionContainer.classList.remove("hidden");
            showQuestion();
        } else {
            setupContainer.classList.remove("hidden");
        }
    }

    function showQuestion() {
        // Reset Timer UI
        clearInterval(timer);
        timeLeft = 15;
        timerBar.style.width = "100%";
        timerText.textContent = "15s";

        nextBtn.classList.add("hidden");
        const currentQuestion = questions[currentQuestionIndex];
        
        questionText.textContent = currentQuestion.question;
        choicesList.innerHTML = ""; 

        currentQuestion.choices.forEach((choice) => {
            const btn = document.createElement("button");
            btn.classList.add("choice-btn"); // Uses the new CSS class
            btn.textContent = choice;
            btn.addEventListener("click", () => selectAnswer(choice, btn));
            choicesList.appendChild(btn);
        });

        startTimer();
    }

    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft + "s";
            
            // Visual bar shrinking
            const percentage = (timeLeft / 15) * 100;
            timerBar.style.width = percentage + "%";

            if (timeLeft <= 0) {
                clearInterval(timer);
                handleTimeout();
            }
        }, 1000);
    }

    function handleTimeout() {
        // Disable all buttons
        const allChoices = choicesList.querySelectorAll('.choice-btn');
        allChoices.forEach(btn => btn.disabled = true);
        
        // Show correct answer even if they timed out
        const correctAnswer = questions[currentQuestionIndex].answer;
        allChoices.forEach(btn => {
            if (btn.textContent === correctAnswer) btn.classList.add('correct');
        });

        alert("⏳ Time's up!");
        nextBtn.classList.remove("hidden");
    }

    function selectAnswer(choice, selectedBtn) {
        clearInterval(timer);
        const correctAnswer = questions[currentQuestionIndex].answer;
        
        const allChoices = choicesList.querySelectorAll('.choice-btn');
        allChoices.forEach(btn => btn.disabled = true); // Prevent multiple clicks

        if (choice === correctAnswer) {
            score++;
            selectedBtn.classList.add('correct');
        } else {
            selectedBtn.classList.add('wrong');
            // Show the user the right answer
            allChoices.forEach(btn => {
                if (btn.textContent === correctAnswer) btn.classList.add('correct');
            });
        }
        
        nextBtn.classList.remove("hidden");
    }

    function showResult() {
        questionContainer.classList.add("hidden");
        resultContainer.classList.remove("hidden");
        scoreDisplay.textContent = `${score} out of ${questions.length}`;
    }
});