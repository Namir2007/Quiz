let questionNumber = 1;
let score = 0;
let streak = 0;
let timerInterval;
let currentGameId;
let currentQuestionId;
let correctAnswersCount = 0;

// Check authentication when page loads
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  // Dohvati podatke o korisniku (uključujući coine)
  await fetchUserData();
  
  // Dohvati najbolji rezultat korisnika
  await fetchBestScore();
  
  // Reset streak
  updateStreak(0);
  
  // Započni kviz
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
      window.location.href = 'login.html';
      return;
    }

    const res = await fetch("https://quiz-be-zeta.vercel.app/game/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Failed to fetch questions');
    }

    const data = await res.json();

    if (!data.question) {
      throw new Error('No questions available');
    }

    currentGameId = data.gameId;
    showQuestion(data.question);
  } catch (error) {
    console.error(error);
    alert('Došlo je do greške pri učitavanju pitanja. Molimo pokušajte ponovo.');
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
  // Ako je korisnik završio 10 pitanja ili nema više pitanja, završi kviz
  if (!question || questionNumber > 10) {
    endQuiz();
    return;
  }

  // Koristimo vrijeme iz odgovora servera ili default 30 sekundi ako nije postavljeno
  const timeLimit = question.timeLimit || 30;
  startTimer(timeLimit);

  currentQuestionId = question._id;

  document.getElementById("question-text").textContent = question.title;
  
  // Update progress bar
  const progressBar = document.querySelector('.progress');
  const progressPercentage = (questionNumber / 10) * 100;
  progressBar.style.width = `${progressPercentage}%`;

  // Update question number
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
    // Prvo dohvatimo trenutni profil korisnika
    const profileResponse = await fetch("https://quiz-be-zeta.vercel.app/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    const userData = await profileResponse.json();
    
    // Uvijek šaljemo novi score na server
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

    // Ako je novi score veći od najboljeg, ažuriramo prikaz
    if (score > userData.bestScore) {
      document.querySelector('.stat-card:nth-child(2) strong').textContent = score;
    }
  } catch (error) {
    console.error("Greška pri ažuriranju rezultata:", error);
  }
}

function endQuiz() {
  clearInterval(timerInterval);
  
  const modal = document.getElementById('quiz-end-modal');
  modal.style.display = 'flex';
  
  document.getElementById('final-score').textContent = score;
  
  // Dohvati svježe podatke o coinima sa servera prije prikaza
  fetchUserData().then(() => {
    const currentCoins = localStorage.getItem('userCoins') || '0';
    document.getElementById('modal-coins').textContent = currentCoins;
  });
  
  updateScore().then(() => {
    fetchUserRank();
  });
}

async function fetchUserRank() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    document.getElementById('final-rank').textContent = "?";
    return;
  }
  
  try {
    const leaderboardResponse = await fetch("https://quiz-be-zeta.vercel.app/leaderboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const leaderboardData = await leaderboardResponse.json();
    
    const profileResponse = await fetch("https://quiz-be-zeta.vercel.app/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const currentUser = await profileResponse.json();
    
    const userRank = leaderboardData.findIndex(user => user.username === currentUser.username) + 1;
    document.getElementById('final-rank').textContent = userRank > 0 ? `#${userRank}` : "?";
    
  } catch (error) {
    console.error("Greška pri dohvaćanju podataka:", error);
    document.getElementById('final-rank').textContent = "?";
  }
}

function closeModal() {
  const modal = document.getElementById('quiz-end-modal');
  modal.style.display = 'none';
  
  // Ukloni revive dugme ako postoji
  const reviveButton = document.querySelector('.revive-button');
  if (reviveButton) {
    reviveButton.remove();
  }
  
  // Reset game state
  questionNumber = 1;
  score = 0;
  updateStreak(0);
  document.querySelector('.stat-card:first-child strong').textContent = '0';
  
  // Clear any existing timer
  clearInterval(timerInterval);
  
  // Start new game
  loadQuestion();
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
    
    // Ažuriraj prikaz najboljeg rezultata
    document.querySelector('.stat-card:nth-child(2) strong').textContent = userData.bestScore || '0';
  } catch (error) {
    console.error("Greška pri dohvatanju najboljeg rezultata:", error);
    document.querySelector('.stat-card:nth-child(2) strong').textContent = '0';
  }
}

function showReviveOption() {
  clearInterval(timerInterval);
  
  const currentCoins = parseInt(localStorage.getItem('userCoins')) || 0;
  const finishButtons = document.querySelector('.finish-buttons');
  
  const reviveButton = document.createElement('button');
  reviveButton.className = 'btn-start revive-button';
  reviveButton.textContent = 'Nastavi sa kvizom (10 coina)';
  reviveButton.style.marginTop = '15px';
  reviveButton.style.width = '100%';
  reviveButton.onclick = handleRevive;
  
  if (currentCoins < 10) {
    reviveButton.disabled = true;
    reviveButton.title = 'Potrebno 10 coina';
  }
  
  finishButtons.appendChild(reviveButton);
  
  // Prikaži modal
  const modal = document.getElementById('quiz-end-modal');
  modal.style.display = 'flex';
}

async function handleRevive() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    // Prvo provjeri trenutne coine
    const currentCoins = parseInt(localStorage.getItem('userCoins')) || 0;
    if (currentCoins < 10) {
      alert('Nemate dovoljno coina za nastavak!');
      return;
    }

    // Prvo oduzmi coine na serveru
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

    // Nastavi sa igrom
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

    const data = await response.json();
    
    if (data.success && data.nextQuestion) {
      // Ažuriraj lokalni prikaz coina
      localStorage.setItem('userCoins', currentCoins - 10);
      updateCoinsDisplay(currentCoins - 10);
      
      // Ukloni revive dugme i nastavi sa igrom
      document.querySelector('.revive-container')?.remove();
      
      // Sakrij modal ako je otvoren
      const modal = document.getElementById('quiz-end-modal');
      if (modal) {
        modal.style.display = 'none';
      }
      
      // Prikaži novo pitanje
      showQuestion(data.nextQuestion);
      
      // Omogući dugmad za odgovore ponovo
      document.querySelectorAll(".option-btn").forEach((btn) => {
        btn.disabled = false;
        btn.classList.remove("correct", "wrong");
      });
    }
  } catch (error) {
    console.error('Error during revive:', error);
    alert('Došlo je do greške prilikom nastavka igre. Pokušajte ponovo.');
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
    
    // Ažuriraj prikaz coina na svim mjestima
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
      
      // Dohvati svježe podatke sa servera nakon ažuriranja
      await fetchUserData();
    } else {
      throw new Error('Failed to update coins on server');
    }
  } catch (error) {
    console.error('Error updating coins:', error);
  }
}

// Dodaj periodično osvježavanje coina
setInterval(async () => {
  await fetchUserData();
}, 30000); // Osvježi svakih 30 sekundi 