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

// Funkcija koja se poziva kad se stranica učita
document.addEventListener('DOMContentLoaded', function() {
  checkAuthState();
});

// Provjera stanja autentifikacije
function checkAuthState() {
  const token = localStorage.getItem('token');
  const guestButtons = document.querySelector('.guest-buttons');
  const userButtons = document.querySelector('.user-buttons');
  
  if (token) {
    // Korisnik je ulogovan
    guestButtons.style.display = 'none';
    userButtons.style.display = 'flex';
  } else {
    // Korisnik nije ulogovan
    guestButtons.style.display = 'flex';
    userButtons.style.display = 'none';
  }
}

// Funkcija za odjavljivanje
async function handleLogout() {
  try {
    // Brisanje tokena iz localStorage
    localStorage.removeItem('token');
    
    // Ažuriranje prikaza dugmadi
    checkAuthState();
    
    // Redirect na početnu stranicu
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

