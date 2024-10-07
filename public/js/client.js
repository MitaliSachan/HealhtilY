document.querySelectorAll(".dropdown-item").forEach(function (item) {
  item.addEventListener("click", function () {
    var selectedValue = this.getAttribute("data-value");
    var dropdownId =
      this.closest(".dropdown").querySelector(".dropdown-toggle").id;

    // Store the selected value in hidden input fields
    document.getElementById(dropdownId + "-hidden").value = selectedValue;
  });
});

function spinner() {
  document.getElementsByClassName("loader")[0].style.display = "block";
}
