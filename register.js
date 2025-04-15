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

async function loginUser() {
  console.log(123)
  if (!validateForm()) {
    return;
  }

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(
      "https://quiz-be-zeta.vercel.app/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (data.message)
    if (response.ok) {
      localStorage.setItem("authToken", data.token);
      console.log("Token je sačuvan:", data.token);
      window.location.href = "/dashboard";
    } else {
      console.error("Greška pri prijavi:", data.message);
      alert(data.message);
    }
  } catch (error) {
    console.error("Došlo je do greške:", error);
    alert("Došlo je do greške pri komunikaciji sa serverom.");
  }
}

button.addEventListener("click", () => console.log(123));
