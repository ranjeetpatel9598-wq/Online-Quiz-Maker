let currentUser = localStorage.getItem('quiz_user');
let users = JSON.parse(localStorage.getItem('quiz_users')) || [];
let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
let isLoginMode = true;
let draftQuestions = [];
let activeQuiz = null;
let currentQIndex = 0;
let userAnswers = [];
let currentScore = 0;

function init() {
    updateNav();
    showPage('home');
}

function updateNav() {
    if (currentUser) {
        document.getElementById('nav-login').style.display = 'none';
        document.getElementById('nav-logout').style.display = 'inline-block';
    } else {
        document.getElementById('nav-login').style.display = 'inline-block';
        document.getElementById('nav-logout').style.display = 'none';
    }
}

function showPage(pageId) {
    let pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'quiz-list') {
        renderQuizzes();
    }
}

function toggleAuth() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('auth-toggle').innerText = isLoginMode ? 'Need an account? Register here.' : 'Already have an account? Login here.';
}

function handleAuth() {
    let user = document.getElementById('username').value;
    let pass = document.getElementById('password').value;
    if (!user || !pass) {
        alert("Please fill all fields");
        return;
    }
    if (isLoginMode) {
        let found = users.find(u => u.username === user && u.password === pass);
        if (found) {
            currentUser = user;
            localStorage.setItem('quiz_user', user);
            updateNav();
            showPage('home');
        } else {
            alert("Invalid credentials");
        }
    } else {
        let exists = users.find(u => u.username === user);
        if (exists) {
            alert("User already exists");
        } else {
            users.push({ username: user, password: pass });
            localStorage.setItem('quiz_users', JSON.stringify(users));
            alert("Registration successful. Please login.");
            toggleAuth();
        }
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('quiz_user');
    updateNav();
    showPage('home');
}

function goToCreate() {
    if (!currentUser) {
        alert("Please login to create a quiz");
        showPage('auth');
    } else {
        draftQuestions = [];
        document.getElementById('temp-questions').innerHTML = '';
        document.getElementById('quiz-title').value = '';
        showPage('create-quiz');
    }
}

function addQuestion() {
    let qText = document.getElementById('q-text').value;
    let optA = document.getElementById('opt-a').value;
    let optB = document.getElementById('opt-b').value;
    let optC = document.getElementById('opt-c').value;
    let optD = document.getElementById('opt-d').value;
    let correct = document.getElementById('correct-opt').value;
    
    if (!qText || !optA || !optB || !optC || !optD || !correct) {
        alert("Please fill all question fields");
        return;
    }
    
    let question = {
        q: qText,
        options: { A: optA, B: optB, C: optC, D: optD },
        correct: correct
    };
    
    draftQuestions.push(question);
    let li = document.createElement('li');
    li.innerText = "Q" + draftQuestions.length + ": " + qText;
    document.getElementById('temp-questions').appendChild(li);
    
    document.getElementById('q-text').value = '';
    document.getElementById('opt-a').value = '';
    document.getElementById('opt-b').value = '';
    document.getElementById('opt-c').value = '';
    document.getElementById('opt-d').value = '';
    document.getElementById('correct-opt').value = '';
}

function saveQuiz() {
    let title = document.getElementById('quiz-title').value;
    if (!title || draftQuestions.length === 0) {
        alert("Please enter a title and add at least one question");
        return;
    }
    
    let newQuiz = {
        id: Date.now(),
        creator: currentUser,
        title: title,
        questions: draftQuestions
    };
    
    quizzes.push(newQuiz);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    alert("Quiz saved successfully!");
    showPage('home');
}

function goToList() {
    showPage('quiz-list');
}

function renderQuizzes() {
    let container = document.getElementById('quizzes-container');
    container.innerHTML = '';
    
    if (quizzes.length === 0) {
        container.innerHTML = '<p>No quizzes available yet.</p>';
        return;
    }
    
    quizzes.forEach(quiz => {
        let div = document.createElement('div');
        div.className = 'quiz-item';
        div.innerHTML = `
            <div>
                <h3>${quiz.title}</h3>
                <small>By: ${quiz.creator} | ${quiz.questions.length} Questions</small>
            </div>
            <button onclick="startQuiz(${quiz.id})">Start Quiz</button>
        `;
        container.appendChild(div);
    });
}

function startQuiz(id) {
    if (!currentUser) {
        alert("Please login to take a quiz");
        showPage('auth');
        return;
    }
    
    activeQuiz = quizzes.find(q => q.id === id);
    currentQIndex = 0;
    userAnswers = [];
    currentScore = 0;
    
    document.getElementById('active-quiz-title').innerText = activeQuiz.title;
    showPage('take-quiz');
    renderQuestion();
}

function renderQuestion() {
    let qData = activeQuiz.questions[currentQIndex];
    document.getElementById('question-display').innerText = qData.q;
    
    let totalQ = activeQuiz.questions.length;
    document.getElementById('q-tracker').innerText = `Question ${currentQIndex + 1}/${totalQ}`;
    
    let progressPercent = ((currentQIndex) / totalQ) * 100;
    document.getElementById('quiz-progress-bar').style.width = progressPercent + '%';
    
    let optContainer = document.getElementById('options-display');
    optContainer.innerHTML = '';
    
    let optionsArr = ['A', 'B', 'C', 'D'];
    optionsArr.forEach(key => {
        let btn = document.createElement('button');
        btn.className = 'ui-option-btn';
        btn.innerHTML = `<span class="option-letter">${key}</span> <span class="option-text">${qData.options[key]}</span>`;
        btn.onclick = () => selectOption(key, btn);
        optContainer.appendChild(btn);
    });
    
    document.getElementById('next-btn').style.display = 'none';
}

function selectOption(key, btnDom) {
    let buttons = document.querySelectorAll('.ui-option-btn');
    buttons.forEach(b => b.classList.remove('selected'));
    btnDom.classList.add('selected');
    
    userAnswers[currentQIndex] = key;
    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    if (userAnswers[currentQIndex] === activeQuiz.questions[currentQIndex].correct) {
        currentScore++;
    }
    
    currentQIndex++;
    
    if (currentQIndex < activeQuiz.questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('score-display').innerText = `You scored ${currentScore} out of ${activeQuiz.questions.length}`;
    
    let reviewDiv = document.getElementById('review-container');
    reviewDiv.innerHTML = '';
    
    activeQuiz.questions.forEach((q, index) => {
        let uAns = userAnswers[index];
        let isCorrect = uAns === q.correct;
        
        let d = document.createElement('div');
        d.className = 'review-item';
        d.innerHTML = `
            <p><strong>Q: ${q.q}</strong></p>
            <p>Your Answer: ${uAns ? q.options[uAns] : 'None'} 
               <span class="${isCorrect ? 'correct-text' : 'wrong-text'}">
                 ${isCorrect ? '(Correct)' : '(Wrong)'}
               </span>
            </p>
            ${!isCorrect ? `<p class="correct-text">Correct Answer: ${q.options[q.correct]}</p>` : ''}
        `;
        reviewDiv.appendChild(d);
    });
    
    showPage('results');
}

window.onload = init;