document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loginButton = document.getElementById("loginBtn");
    const buttonSpinner = document.getElementById("loadingState");
    const buttonText = document.getElementById("btnTxt");
    const failToast = document.getElementById("failToast");

    buttonSpinner.classList.remove("hidden");
    buttonText.classList.add("hidden");
    loginButton.classList.add("disabled");

    try {
      const user = await window.api.login(username, password);
      if (user) {
        window.api.notifyLoginSuccess();
      } else {
        failToast.classList.remove("hidden");
        setTimeout(() => {
          failToast.classList.add("hidden");
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      buttonSpinner.classList.add("hidden");
      buttonText.classList.remove("hidden");
      loginButton.classList.remove("disabled");
    }
  });

document.getElementById("gojo").addEventListener("mouseenter", () => {
  failToast.innerHTML = "Gojo is gay";
  failToast.classList.remove("hidden");
  setTimeout(() => {
    failToast.classList.add("hidden");
  }, 100);
});
