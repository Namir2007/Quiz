const submitButton = document.getElementById("submit");
const form = document.getElementById("loginForm");

function validatePassword(password) {
  let Uppercase = false;
  let Lowercase = false;
  let Number = false;
  let Symbol = false;
  const symbols = "!@#$%^&*()-_=+[]{};:,.<>?";

  if (password.length < 8) {
    alert("Lozinka mora imati najmanje 8 karaktera.");
    return false;
  }

  for (let i = 0; i < password.length; i++) {
    const char = password[i];
    if (char >= "A" && char <= "Z") Uppercase = true;
    else if (char >= "a" && char <= "z") Lowercase = true;
    else if (char >= "0" && char <= "9") Number = true;
    else if (symbols.includes(char)) Symbol = true;
  }

  if (!Uppercase) {
    alert("Lozinka mora imati barem jedno VELIKO slovo.");
    return false;
  }
  if (!Lowercase) {
    alert("Lozinka mora imati barem jedno malo slovo.");
    return false;
  }
  if (!Number) {
    alert("Lozinka mora imati barem jedan broj.");
    return false;
  }
  if (!Symbol) {
    alert("Lozinka mora imati barem jedan specijalni znak.");
    return false;
  }

  return true;
}

function validateForm() {
  const name = document.getElementById("firstName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password || !name) {
    alert("Molimo popunite sva polja.");
    return false;
  }

  if (!validatePassword(password)) {
    return false;
  }

  return true;
}

async function registerUser() {
  if (!validateForm()) {
    return;
  }

  const name = document.getElementById("firstName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(
      "https://quiz-be-zeta.vercel.app/auth/register ",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password 
        }),
      }
    );

    const data = await response.json();

    if (data.message)
      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        console.log("Token je sačuvan:", data.token);
        window.location.href = "index.html";
      } else {
        console.error("Greška pri prijavi:", data.message);
        alert(data.message);
      }
  } catch (error) {
    console.error("Došlo je do greške:", error);
    alert("Došlo je do greške pri komunikaciji sa serverom.");
  }
}

submitButton.addEventListener("click", registerUser);