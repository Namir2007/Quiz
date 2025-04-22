async function loadLeaderboard() {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      "https://quiz-be-zeta.vercel.app/leaderboard",
      {
        method: "GET",
      }
    );

    const fetchProfile = await fetch(
      "https://quiz-be-zeta.vercel.app/auth/profile",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const profile = await fetchProfile.json();

    if (!response.ok) {
      throw new Error("Greška pri dohvaćanju podataka.");
    }

    const leaderboardData = await response.json();

    const scoreDivs = document.querySelectorAll("#score");

    const leaderboard = [...leaderboardData.splice(0, 5), profile];

    leaderboard.forEach((item, index) => {
      if (index < scoreDivs.length) {
        const position = index < 5 ? index + 1 : "Ti";
        scoreDivs[index].innerHTML = `
          <span class="left"><span>#${position}</span><span>${item.username}</span></span>
          <span class="right">${item.bestScore} poena</span>
        `;
      }
    });
  } catch (error) {
    console.error("Greška:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadLeaderboard);
