function loadtheme() {
  try {
    var bg = localStorage.getItem("bgcolor");
    document.documentElement.style.backgroundColor = bg;
  } catch (e) {
    console.log(e);
  }
}

loadtheme();
