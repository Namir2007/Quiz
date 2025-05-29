const createUser = () => {
  fetch("https://c986-77-239-14-36.ngrok-free.app/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "jasmin.fajkic@gmail.com",
      password: "kalerias1982",
      firstName: "Jasmin",
      lastName: "Fajkic",
    }),
  })
    .then((response) => {
      response.json().then((data) => {
        console.log(data);
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

function showQuiz() {
  document.getElementById('introQuiz').style.display = 'flex';
}

function hideQuiz() {
  document.getElementById('introQuiz').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  checkAuthState();
  initializeCoins();
});

function checkAuthState() {
  const token = localStorage.getItem('token');
  const guestButtons = document.querySelector('.guest-buttons');
  const userButtons = document.querySelector('.user-buttons');
  
  if (token) {
    guestButtons.style.display = 'none';
    userButtons.style.display = 'flex';
  } else {
    guestButtons.style.display = 'flex';
    userButtons.style.display = 'none';
  }
}

async function handleLogout() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Pokušaj odjavu na serveru
    await fetch('https://quiz-be-zeta.vercel.app/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Očisti sve lokalne podatke
    localStorage.clear();
    sessionStorage.clear();
    
    // Ažuriraj prikaz UI-a
    checkAuthState();
    
    // Preusmjeri na početnu
    window.location.replace('login.html');
  } catch (error) {
    console.error('Error during logout:', error);
    // Čak i ako server-side logout ne uspije, očisti lokalno
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('login.html');
  }
}

function initializeCoins() {
    const coins = localStorage.getItem('userCoins') || 0;
    document.getElementById('coinsAmount').textContent = coins;
}

function updateCoins(amount) {
    const currentCoins = parseInt(localStorage.getItem('userCoins')) || 0;
    const newAmount = currentCoins + amount;
    localStorage.setItem('userCoins', newAmount);
    document.getElementById('coinsAmount').textContent = newAmount;
}

const token = localStorage.getItem('token');
if (token) {
  fetch('https://quiz-be-zeta.vercel.app/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Profile data:', data);
  })
  .catch(error => {
    console.error('Error fetching profile:', error);
  });
}

