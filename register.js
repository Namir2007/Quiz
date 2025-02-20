const button = document.getElementById("button");
const registerForm = document.getElementById("registerForm");

function validateForm() {
  const email = document.getElementById("email").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const password = document.getElementById("password").value;

  if (!email || !firstName || !lastName || !password) {
    alert("Molimo popunite sva polja.");
    return false;
  }
  return true;
}

async function registerUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(
      "https://0c6e-77-239-14-36.ngrok-free.app/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          username: firstName,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("authToken", data.user.token);
      console.log("Token je sačuvan:", data.user.token);
      window.location.href = "/dashboard";
    } else {
      console.error("Greška pri registraciji:", data.message);
      alert("Došlo je do greške pri registraciji. Pokušajte ponovo.");
    }
  } catch (error) {
    console.error("Došlo je do greške:", error);
    alert("Došlo je do greške pri komunikaciji sa serverom.");
  }
}

button.addEventListener("click", registerUser);
