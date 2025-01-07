document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const user = await window.api.login(username, password);
      if (user) {
        window.api.notifyLoginSuccess();
      } else {
        alert("Invalid username or password");
      }
    } catch (error) {
      console.error(error);
    }
  });
