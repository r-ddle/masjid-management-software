// ? Select Location Model
function showLocationModal(show) {
  const locationModal = document.getElementById("locationModal");
  if (show) {
    locationModal.showModal();
  } else {
    locationModal.close();
  }
}

let JanazaData = [];
let selectedLocation = "";

async function loadLocation(location) {
  try {
    updateHeaderText(location);
    const data = await window.api.fetchMembers(location);
    console.log(data);
    updateJanazaData(data, location);
    renderJanazaTable(data);
  } catch (error) {
    console.error(error);
  }

  console.log("Loading location: " + location);
}

function updateJanazaData(data, location) {
  JanazaData = data;
  selectedLocation = location;
}

function updateHeaderText(locationTxt) {
  const locationHeader = document.getElementById("locationHeader");
  showLocationModal(false);
  if (locationHeader) {
    locationHeader.innerText = locationTxt;
  }
  console.log("Updating header text: " + locationTxt);
}

function renderJanazaTable(data) {
  const tableBody = document.getElementById("janazaTableBody");
  tableBody.innerHTML = "";

  data.forEach((member) => {
    const row = document.createElement("tr");

    // Name cell
    const nameTd = document.createElement("td");
    nameTd.textContent = member.name || "";
    row.appendChild(nameTd);

    // Address cell
    const addressTd = document.createElement("td");
    addressTd.textContent = member.address || "";
    row.appendChild(addressTd);

    // Telephone cell
    const phoneTd = document.createElement("td");
    phoneTd.textContent = member.telephone || "";
    row.appendChild(phoneTd);

    // Payment status (months)
    const paymentTd = document.createElement("td");

    // Loop through months
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];

    months.forEach((month) => {
      const btn = document.createElement("button");
      btn.className = "btn"; // no color by default
      btn.textContent = month.charAt(0).toUpperCase() + month.slice(1);

      const status = member.janaza_2024?.[month] || "Not Paid"; // Get status for the month

      // Set button color based on status
      if (status === "Paid") {
        btn.classList.add("btn-success");
      } else if (status === "Not Paid") {
        btn.classList.add("btn-error");
      }

      // Add event listener to handle button click
      btn.addEventListener("click", () =>
        handleMonthButtonClick(btn, member, month, selectedLocation)
      );

      paymentTd.appendChild(btn);
    });

    row.appendChild(paymentTd);

    // Actions cell
    const actionTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-info";
    editBtn.textContent = "Edit";
    // Edit button logic here...
    actionTd.appendChild(editBtn);
    row.appendChild(actionTd);

    tableBody.appendChild(row);
  });
}

async function handleMonthButtonClick(button, JanazaData, month, location) {
  button.classList.remove("btn-error", "btn-success");

  button.innerText = "Loading...";

  setTimeout(async () => {
    try {
      const updatedStatus = "Paid";
      await window.api.updateMemberStatus(
        JanazaData._id,
        month,
        updatedStatus,
        location
      );

      button.classList.add("btn-success");
      button.innerText = month.charAt(0).toUpperCase() + month.slice(1);
    } catch (error) {
      console.error("Error updating member status: ", error);
      button.classList.add("btn-error");
      button.innerText = "Error";
    }
  }, 2000);
}
