const btn = document.getElementById("score");

async function getUsers() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.error("Niste prijavljeni. Token nije pronađen.");
    return;
  }

  try {
    const response = await fetch("https://0c6e-77-239-14-36.ngrok-free.app/users", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Greška pri dohvatanju korisnika:", error);
  }
}

btn.addEventListener("click", getUsers);