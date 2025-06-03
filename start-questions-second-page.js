let timerInterval;
let currentGameId;
let currentQuestionId;
let questionNumber = 1;
let score = 0;
let streak = 0;
let correctAnswersCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  await fetchUserData();
  
  await fetchBestScore();
  
  updateStreak(0);
  
  loadQuestion();
});

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://quiz-be-zeta.vercel.app/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      checkAuthStatus();
    } else {
      alert(data.message || 'Greška pri prijavi. Provjerite vaše podatke.');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Došlo je do greške pri prijavi. Pokušajte ponovo.');
  }
}

async function loadQuestion() {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error('No authentication token found');
      window.location.href = 'login.html';
      return;
    }

    const optionsContainer = document.getElementById("options-container");
    const questionText = document.getElementById("question-text");
    if (optionsContainer) optionsContainer.innerHTML = "";
    if (questionText) questionText.textContent = "Učitavanje pitanja...";

    const res = await fetch("https://quiz-be-zeta.vercel.app/game/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        console.error('Authentication failed');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
      }
      throw new Error(`Failed to fetch questions: ${res.status}`);
    }

    const data = await res.json();

    if (!data.question) {
      throw new Error('No questions available from server');
    }
    currentGameId = data.gameId;
    showQuestion(data.question);

    const progressBar = document.querySelector('.progress');
    if (progressBar) progressBar.style.width = '10%';
    
    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("correct", "wrong");
    });

  } catch (error) {
    console.error('Error in loadQuestion:', error);
    alert('Došlo je do greške pri učitavanju pitanja. Molimo pokušajte ponovo.');
    
    const questionText = document.getElementById("question-text");
    if (questionText) {
      questionText.textContent = "Došlo je do greške pri učitavanju pitanja. Kliknite 'Igraj ponovo' da pokušate ponovo.";
    }
  }
}

function startTimer(timeLimit) {
  let timeLeft = timeLimit;
  document.getElementById("timer").textContent = timeLeft;

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endQuiz();
    }
  }, 1000);
}

function updateStreak(newStreak) {
  streak = newStreak;
  document.querySelector('.stat-card:nth-child(3) strong').textContent = streak;
}

function showQuestion(question) {
  if (!question || questionNumber > 10) {
    endQuiz();
    return;
  }
  
  const timeLimit = question.timeLimit || 30;
  startTimer(timeLimit);

  currentQuestionId = question._id;

  document.getElementById("question-text").textContent = question.title;
  
  const progressBar = document.querySelector('.progress');
  const progressPercentage = (questionNumber / 10) * 100;
  progressBar.style.width = `${progressPercentage}%`;

  document.querySelector('.question-header span').textContent = `Pitanje ${questionNumber} od 10`;

  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";

  question.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span>${String.fromCharCode(65 + index)}</span> ${option.text}`;

    btn.addEventListener("click", async () => {
      clearInterval(timerInterval);
      document.querySelectorAll(".option-btn").forEach((b) => (b.disabled = true));
      
      try {
        const res = await fetch("https://quiz-be-zeta.vercel.app/game/answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            gameId: currentGameId,
            questionId: currentQuestionId,
            answer: option.text,
            timeLeft: parseInt(document.getElementById("timer").textContent)
          }),
        });

        const result = await res.json();

        if (result.correct) {
          correctAnswersCount++;
          if (correctAnswersCount % 5 === 0) {
            updateCoins(1);
          }
          const points = result.points || 10;
          score += points;
          
          updateStreak(streak + 1);
          
          btn.classList.add("correct");
          document.querySelector('.stat-card:first-child strong').textContent = score;
          
          if (questionNumber === 10) {
            setTimeout(() => {
              endQuiz();
            }, 1000);
          } else {
            questionNumber++;
            setTimeout(() => {
              showQuestion(result.nextQuestion);
            }, 1000);
          }
        } else {
          btn.classList.add("wrong");
          updateStreak(0);
          
          const correctOption = question.options.find(opt => opt.correct);
          if (correctOption) {
            const correctButton = Array.from(document.querySelectorAll('.option-btn'))
              .find(b => b.textContent.includes(correctOption.text));
            if (correctButton) {
              correctButton.classList.add("correct");
            }
          }
          showReviveOption();
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
        alert("Došlo je do greške pri slanju odgovora. Molimo pokušajte ponovo.");
        endQuiz();
      }
    });

    optionsContainer.appendChild(btn);
  });
}

async function updateScore() {
  const token = localStorage.getItem("token");
  
  if (!token) return;
  
  try {
    const profileResponse = await fetch("https://quiz-be-zeta.vercel.app/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    const userData = await profileResponse.json();
    
    const updateResponse = await fetch("https://quiz-be-zeta.vercel.app/leaderboard/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score: score }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update score');
    }
    
    if (score > userData.bestScore) {
      const bestScoreElement = document.querySelector('.stat-card:nth-child(2) strong');
      if (bestScoreElement) {
        bestScoreElement.textContent = score;
      }
    }

    return score;
  } catch (error) {
    console.error("Greška pri ažuriranju rezultata:", error);
    alert('Došlo je do greške pri ažuriranju rezultata. Pokušajte ponovo.');
  }
}

function endQuiz() {
  clearInterval(timerInterval);
  
  const modal = document.getElementById('quiz-end-modal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  
  const finalScoreElement = document.getElementById('final-score');
  if (finalScoreElement) {
    finalScoreElement.textContent = score;
  }
  
  updateScore().then(() => {
    fetchUserRank().then(() => {
      fetchUserData().then(() => {
        const currentCoins = localStorage.getItem('userCoins') || '0';
        const modalCoins = document.getElementById('modal-coins');
        if (modalCoins) {
          modalCoins.textContent = currentCoins;
        }
      });
    });
  });
}

async function fetchUserRank() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    const rankElement = document.getElementById('final-rank');
    if (rankElement) {
      rankElement.textContent = "?";
    }
    return;
  }
  
  try {
    const leaderboardResponse = await fetch("https://quiz-be-zeta.vercel.app/leaderboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!leaderboardResponse.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    const leaderboardData = await leaderboardResponse.json();
    
    const profileResponse = await fetch("https://quiz-be-zeta.vercel.app/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    const currentUser = await profileResponse.json();
    
    const userRank = leaderboardData.findIndex(user => user.username === currentUser.username) + 1;
    
    const rankElement = document.getElementById('final-rank');
    if (rankElement) {
      if (userRank > 0) {
        rankElement.textContent = `#${userRank}`;
        rankElement.classList.add('rank-updated');
      } else {
        rankElement.textContent = "?";
      }
    }
    
    return userRank;
  } catch (error) {
    console.error("Greška pri dohvaćanju ranka:", error);
    const rankElement = document.getElementById('final-rank');
    if (rankElement) {
      rankElement.textContent = "?";
    }
  }
}

function closeModal() {
  try {
    const modal = document.getElementById('quiz-end-modal');
    if (!modal) {
      console.error('Quiz end modal not found');
      return;
    }
    modal.style.display = 'none';
    
    const reviveButton = document.querySelector('.revive-button');
    if (reviveButton) {
      reviveButton.remove();
    }
    
    questionNumber = 1;
    score = 0;
    correctAnswersCount = 0;
    updateStreak(0);
    
    const scoreDisplay = document.querySelector('.stat-card:first-child strong');
    if (scoreDisplay) {
      scoreDisplay.textContent = '0';
    } else {
      console.error('Score display element not found');
    }
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    const progressBar = document.querySelector('.progress');
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    
    const questionDisplay = document.querySelector('.question-header span');
    if (questionDisplay) {
      questionDisplay.textContent = 'Pitanje 1 od 10';
    }

    loadQuestion().catch(error => {
      console.error('Failed to load new question:', error);
      alert('Došlo je do greške pri pokretanju novog kviza. Molimo osvježite stranicu i pokušajte ponovo.');
    });
  } catch (error) {
    console.error('Error in closeModal:', error);
    alert('Došlo je do greške. Molimo osvježite stranicu i pokušajte ponovo.');
  }
}

function goToLeaderboard() {
  window.location.href = 'index.html#leaderboard';
}

async function fetchBestScore() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const profileResponse = await fetch("https://quiz-be-zeta.vercel.app/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch profile');
    }

    const userData = await profileResponse.json();
    
    document.querySelector('.stat-card:nth-child(2) strong').textContent = userData.bestScore || '0';
  } catch (error) {
    console.error("Greška pri dohvatanju najboljeg rezultata:", error);
    document.querySelector('.stat-card:nth-child(2) strong').textContent = '0';
  }
}

function showReviveOption() {
  try {
    clearInterval(timerInterval);
    
    const currentCoins = parseInt(localStorage.getItem('userCoins')) || 0;
    const finishButtons = document.querySelector('.finish-buttons');
    
    if (!finishButtons) {
      console.error('Finish buttons container not found');
      return;
    }
    
    const existingReviveButton = document.querySelector('.revive-button');
    if (existingReviveButton) {
      existingReviveButton.remove();
    }
    
    const reviveButton = document.createElement('button');
    reviveButton.className = 'btn-start revive-button';
    reviveButton.textContent = 'Nastavi sa kvizom (10 coina)';
    reviveButton.style.marginTop = '15px';
    reviveButton.style.width = '100%';
    
    if (currentCoins < 10) {
      reviveButton.disabled = true;
      reviveButton.title = 'Potrebno 10 coina';
      reviveButton.style.opacity = '0.7';
      reviveButton.style.cursor = 'not-allowed';
    } else {
      reviveButton.title = 'Kliknite da nastavite kviz za 10 coina';
      reviveButton.onclick = handleRevive;
    }
    
    finishButtons.appendChild(reviveButton);
    
    const modal = document.getElementById('quiz-end-modal');
    if (modal) {
      modal.style.display = 'flex';
      
      const modalTitle = modal.querySelector('.finish-header h1');
      const modalMessage = modal.querySelector('.finish-header p');
      
      if (modalTitle) modalTitle.textContent = 'Netačan odgovor!';
      if (modalMessage) modalMessage.textContent = 'Možete nastaviti kviz za 10 coina ili završiti kviz i sačuvati trenutni rezultat.';
    }
  } catch (error) {
    console.error('Error showing revive option:', error);
    endQuiz();
  }
}

async function handleRevive() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const currentCoins = parseInt(localStorage.getItem('userCoins')) || 0;
    if (currentCoins < 10) {
      alert('Nemate dovoljno coina za nastavak!');
      return;
    }

    const updateCoinsResponse = await fetch('https://quiz-be-zeta.vercel.app/auth/update-coins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        coins: currentCoins - 10 
      })
    });

    if (!updateCoinsResponse.ok) {
      throw new Error('Failed to update coins');
    }

    const response = await fetch('https://quiz-be-zeta.vercel.app/game/revive', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId: currentGameId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to revive game');
    }

    const data = await response.json();
    
    if (data.success && data.nextQuestion) {
      localStorage.setItem('userCoins', currentCoins - 10);
      updateCoinsDisplay(currentCoins - 10);
      
      const modal = document.getElementById('quiz-end-modal');
      if (modal) {
        modal.style.display = 'none';
      }
      
      const reviveButton = document.querySelector('.revive-button');
      if (reviveButton) {
        reviveButton.remove();
      }
      
      showQuestion(data.nextQuestion);
      
      document.querySelectorAll(".option-btn").forEach((btn) => {
        btn.disabled = false;
        btn.classList.remove("correct", "wrong");
      });
    } else {
      throw new Error('Failed to get next question');
    }
  } catch (error) {
    console.error('Error during revive:', error);
    alert('Došlo je do greške prilikom nastavka igre. Pokušajte ponovo.');
    
    try {
      const response = await fetch('https://quiz-be-zeta.vercel.app/auth/update-coins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coins: currentCoins })
      });
      if (response.ok) {
        localStorage.setItem('userCoins', currentCoins);
        updateCoinsDisplay(currentCoins);
      }
    } catch (restoreError) {
      console.error('Failed to restore coins:', restoreError);
    }
  }
}

async function fetchUserData() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch('https://quiz-be-zeta.vercel.app/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const userData = await response.json();
  
    
    if (userData.coins !== undefined) {
      localStorage.setItem('userCoins', userData.coins);
      updateCoinsDisplay(userData.coins);
    }

    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

function updateCoinsDisplay(amount) {
  const coinsElement = document.getElementById('coinsAmount');
  const modalCoinsElement = document.getElementById('modal-coins');
  const headerCoinsElement = document.querySelector('.coins-counter span');
  
  if (coinsElement) {
    coinsElement.textContent = amount;
  }
  if (modalCoinsElement) {
    modalCoinsElement.textContent = amount;
  }
  if (headerCoinsElement) {
    headerCoinsElement.textContent = amount;
  }
}

async function updateCoins(amount) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const currentCoins = parseInt(localStorage.getItem('userCoins')) || 0;
  const newAmount = currentCoins + amount;

  try {
    const response = await fetch('https://quiz-be-zeta.vercel.app/auth/update-coins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ coins: newAmount })
    });

    if (response.ok) {
      localStorage.setItem('userCoins', newAmount);
      updateCoinsDisplay(newAmount);
      
      await fetchUserData();
    } else {
      throw new Error('Failed to update coins on server');
    }
  } catch (error) {
    console.error('Error updating coins:', error);
  }
}

setInterval(async () => {
  await fetchUserData();
}, 30000);