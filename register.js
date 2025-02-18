const  button = document.getElementById("button");

async function registerUser() {
  try {
    const response = await fetch(
      "https://0c6e-77-239-14-36.ngrok-free.app/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "namir.buza5@gmail.com",
          password: "12345",
          firstName: "Namir",
          lastName: "Buzađija",
          username: "Mrča",
        }),
      }
    );
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  } finally {
    console.log("Finally");
  }
}

button.addEventListener("click", registerUser);