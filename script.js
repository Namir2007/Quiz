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
}