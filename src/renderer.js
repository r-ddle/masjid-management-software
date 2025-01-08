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

const easteregg = document.getElementById("easteregg");
const failToast = document.getElementById("failToast");
const failMsg = document.getElementById("failToastMsg");

document.getElementById("gojo").addEventListener("mouseenter", () => {
  easteregg.classList.remove("hidden");
  failToast.classList.remove("hidden");
  failMsg.classList.add("hidden");
  setTimeout(() => {
    easteregg.classList.add("hidden");
    failToast.classList.add("hidden");
    failMsg.classList.remove("hidden");
  }, 500);
});
