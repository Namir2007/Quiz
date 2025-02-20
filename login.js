const button = document.getElementById("submit");
const loginForm = document.getElementById("loginForm");

function validateForm() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Molimo popunite sva polja.");
    return false;
  }
  return true;
}

async function loginUser(event) {
  try {
    const response = await fetch(
      "https://0c6e-77-239-14-36.ngrok-free.app/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "namir.buza5@gmail.com",
          password: "12345",
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("authToken", data.user.token);
      console.log("Token je sačuvan:", data.user.token);
    } else {
      console.error("Greška pri prijavi:", data.message);
      alert("Došlo je do greške pri prijavi. Pokušajte ponovo.");
    }
  } catch (error) {
    console.error("Došlo je do greške:", error);
    alert("Došlo je do greške pri komunikaciji sa serverom.");
  }
}

button.addEventListener("click", loginUser);