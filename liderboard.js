async function loadLeaderboard() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    const response = await fetch("https://quiz-be-zeta.vercel.app/leaderboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Greška pri dohvaćanju podataka.");
    }

    const leaderboardData = await response.json();

    const fetchProfile = await fetch("https://quiz-be-zeta.vercel.app/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!fetchProfile.ok) {
      throw new Error("Greška pri dohvaćanju profila.");
    }

    const profile = await fetchProfile.json();

    const scoreDivs = document.querySelectorAll("#score");
    
    const topFive = leaderboardData.slice(0, 5);
    const userInTopFive = topFive.some(user => user.username === profile.username);
    const displayData = userInTopFive ? topFive : [...topFive, profile];

    displayData.forEach((item, index) => {
      if (index < scoreDivs.length) {
        const position = item.username === profile.username ? "Ti" : index + 1;
        scoreDivs[index].innerHTML = `
          <span class="left"><span>#${position}</span><span>${item.username}</span></span>
          <span class="right">${item.bestScore || 0} poena</span>
        `;
      }
    });
  } catch (error) {
    console.error("Greška:", error);
    const scoreDivs = document.querySelectorAll("#score");
    scoreDivs.forEach(div => {
      div.innerHTML = '<span class="left"><span>#-</span><span>N/A</span></span><span class="right">0 poena</span>';
    });
  }
}

window.addEventListener("DOMContentLoaded", loadLeaderboard);
