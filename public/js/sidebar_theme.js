const body = document.querySelector("body"),
  sidebar = body.querySelector("nav"),
  toggle = body.querySelector(".toggle"),
  searchBtn = body.querySelector(".search-box"),
  modeSwitch = body.querySelectorAll(".toggle-switch"),
  modeText = body.querySelectorAll(".mode-text");

toggle.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

searchBtn.addEventListener("click", () => {
  sidebar.classList.remove("close");
});

for (let i = 0; i < modeSwitch.length; i++) modeSwitch[i].addEventListener("click", switchMode);

function switchTheme() {
  if (body.classList.contains("dark")) {
    localStorage.setItem("Dark Mode", true);
    for (let i = 0; i < modeText.length; i++) modeText[i].innerText = "Light mode";
  } else {
    localStorage.setItem("Dark Mode", false);
    for (let i = 0; i < modeText.length; i++) modeText[i].innerText = "Dark mode";
  }
}

switchTheme();

function switchMode() {
  body.classList.toggle("dark");
  switchTheme();
}
