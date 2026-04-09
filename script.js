/** @format */

let currentMode = "",
	currentType = null,
	score = 0,
	wrongCount = 0,
	timeLeft = 0,
	timerInterval;
let examQuestions = [];
const highScores = JSON.parse(localStorage.getItem("mathHighScores")) || {
	mix: 0,
};

function updateHighScoreDisplay() {
	document.getElementById("high-score-display").innerText =
		`🏆 Kỷ lục Tổng hợp: ${highScores.mix} điểm`;
}

function confirmGoHome() {
	if (confirm("Con muốn dừng bài đang làm để về trang chủ không?")) goHome();
}

function goHome() {
	clearInterval(timerInterval);
	document
		.querySelectorAll(".screen")
		.forEach((s) => s.classList.add("hidden"));
	document.getElementById("home-icon-btn").classList.add("hidden");
	document.getElementById("main-menu").classList.remove("hidden");
	updateHighScoreDisplay();
}

function showPracticeMenu() {
	document.getElementById("main-menu").classList.add("hidden");
	document.getElementById("practice-menu").classList.remove("hidden");
	document.getElementById("home-icon-btn").classList.remove("hidden");
}

function showExamMenu() {
	document.getElementById("main-menu").classList.add("hidden");
	document.getElementById("exam-menu").classList.remove("hidden");
	document.getElementById("home-icon-btn").classList.remove("hidden");
}

function startTask(mode, type) {
	currentMode = mode;
	currentType = type;
	document
		.querySelectorAll(".screen")
		.forEach((s) => s.classList.add("hidden"));
	document.getElementById("home-icon-btn").classList.remove("hidden");

	if (mode === "practice") {
		document.getElementById("practice-area").classList.remove("hidden");
		nextPracticeQuestion();
	} else {
		document.getElementById("exam-area").classList.remove("hidden");
		setupExam(type);
	}
}

// LUYỆN TẬP
function nextPracticeQuestion() {
	const q = generateLogic(currentType);
	document.getElementById("p-expression").innerText = q.text;
	document.getElementById("p-answer").value = "";
	document.getElementById("p-answer").focus();
	window.currentQ = q;
}

function checkPracticeAnswer() {
	const userAns = parseInt(document.getElementById("p-answer").value);
	const fb = document.getElementById("practice-feedback");
	if (isNaN(userAns)) return;

	if (userAns === window.currentQ.ans) {
		fb.innerHTML = "✅ Đúng rồi! Giỏi quá!";
		fb.style.color = "green";
		setTimeout(() => {
			fb.innerHTML = "";
			nextPracticeQuestion();
		}, 1200);
	} else {
		fb.innerHTML = `❌ Sai rồi, đáp án là ${window.currentQ.ans}`;
		fb.style.color = "red";
		setTimeout(() => {
			fb.innerHTML = "";
		}, 2000);
	}
}

// ĐỀ THI (Cuộn trang)
function setupExam(type) {
	const numQ = type === "mix" ? 30 : 10;
	const list = document.getElementById("exam-questions-list");
	list.innerHTML = "";
	examQuestions = [];

	for (let i = 0; i < numQ; i++) {
		let t = type === "mix" ? Math.floor(Math.random() * 4) + 1 : type;
		let q = generateLogic(t);
		examQuestions.push(q);

		const div = document.createElement("div");
		div.className = "exam-question-box";
		div.innerHTML = `<span><b>Câu ${i + 1}:</b> ${q.text} = </span>
                         <input type="number" class="exam-input">`;
		list.appendChild(div);
	}

	document.getElementById("exam-progress").innerText = `Tổng: ${numQ} câu`;
	timeLeft = type === "mix" ? 1200 : type == 4 ? 600 : 300;
	startTimer();
}

function startTimer() {
	clearInterval(timerInterval);
	timerInterval = setInterval(() => {
		timeLeft--;
		let m = Math.floor(timeLeft / 60),
			s = timeLeft % 60;
		document.getElementById("exam-timer").innerText =
			`⏱ ${m}:${s < 10 ? "0" + s : s}`;
		if (timeLeft <= 0) confirmSubmit(true);
	}, 1000);
}

function confirmSubmit(isAuto = false) {
	if (isAuto || confirm("Con chắc chắn muốn nộp bài thi không?"))
		calculateResult();
}

function calculateResult() {
	clearInterval(timerInterval);
	score = 0;
	wrongCount = 0;
	const inputs = document.querySelectorAll(".exam-input");
	const review = document.getElementById("review-container");
	review.innerHTML = "<h3>Chi tiết bài làm:</h3>";

	examQuestions.forEach((q, i) => {
		// Lấy giá trị bé nhập vào
		const val = parseInt(inputs[i].value);
		// Kiểm tra đúng sai
		const isCorrect = val === q.ans;

		if (isCorrect) {
			score++;
		} else {
			wrongCount++;
		}

		// Tạo thẻ hiển thị từng câu
		const div = document.createElement("div");
		div.className = `review-card ${isCorrect ? "res-correct" : "res-wrong"}`;
		div.innerHTML = `
            <div class="review-info">
                <span class="review-q">${q.text} = ${q.ans}</span>
                <span class="review-a">${isCorrect ? "Bé đã làm đúng!" : "Bé làm là: " + (isNaN(val) ? "trống" : val)}</span>
            </div>
            <span class="review-icon">${isCorrect ? "✅" : "❌"}</span>
        `;
		review.appendChild(div);
	});

	showFinalResult();
}

function showFinalResult() {
	document.getElementById("exam-area").classList.add("hidden");
	document.getElementById("result-screen").classList.remove("hidden");

	let limit = currentType === "mix" ? 5 : 2;
	const passed = wrongCount <= limit;

	// Thêm huy chương nếu đạt
	const medal = passed ? "🥇" : "💪";
	document.getElementById("result-title").innerHTML =
		`<span class="medal-icon">${medal}</span>${passed ? "GIỎI QUÁ!" : "CỐ GẮNG LÊN!"}`;

	// Hiển thị bảng điểm kiểu mới
	document.getElementById("result-stats").innerHTML = `
        <div class="stat-item">
            <span class="stat-value">${score}</span>
            <span class="stat-label">Đúng</span>
        </div>
        <div class="stat-divider" style="width:2px; height:40px; background:#eee;"></div>
        <div class="stat-item">
            <span class="stat-value" style="color:var(--error)">${wrongCount}</span>
            <span class="stat-label">Sai</span>
        </div>
    `;
}

function generateLogic(t) {
	let a, b, c;
	if (t == 1) {
		a = Math.floor(Math.random() * 10);
		b = Math.floor(Math.random() * 10);
		return Math.random() > 0.5
			? { text: `${a}+${b}`, ans: a + b }
			: { text: `${Math.max(a, b)}-${Math.min(a, b)}`, ans: Math.abs(a - b) };
	}
	if (t == 2) {
		a = Math.floor(Math.random() * 90) + 10;
		b = Math.floor(Math.random() * 10);
		return Math.random() > 0.5
			? { text: `${a}+${b}`, ans: a + b }
			: { text: `${a}-${b}`, ans: a - b };
	}
	if (t == 3) {
		a = Math.floor(Math.random() * 80) + 10;
		b = Math.floor(Math.random() * 80) + 10;
		if (Math.random() > 0.5) {
			while (a + b > 99) {
				a = Math.floor(Math.random() * 50);
				b = Math.floor(Math.random() * 40);
			}
			return { text: `${a}+${b}`, ans: a + b };
		} else {
			if (a < b) [a, b] = [b, a];
			return { text: `${a}-${b}`, ans: a - b };
		}
	}
	// Dạng 4
	a = Math.floor(Math.random() * 20) + 10;
	b = Math.floor(Math.random() * 10);
	c = Math.floor(Math.random() * 10);
	let res = a + b - c;
	if (res < 0) return generateLogic(4);
	return { text: `${a}+${b}-${c}`, ans: res };
}

updateHighScoreDisplay();
