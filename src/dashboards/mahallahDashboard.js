let mahallaData = [];
let filteredData = [];
const LOCATION = "Mahallah Member Details"; // Changed from "Mahalla Member Details Collection"
let selectedLocation = "";

// Load data when page loads
window.onload = async () => {
  await loadMahallaData();
};

document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredData = mahallaData.filter(member => 
    member.name?.toLowerCase().includes(searchTerm) ||
    member.address?.toLowerCase().includes(searchTerm) ||
    member.telephone?.toLowerCase().includes(searchTerm)
  );
  renderMahallaTable(filteredData);
});

async function loadMahallaData() {
  try {
    const data = await window.api.fetchMembers(LOCATION);
    mahallaData = data;
    filteredData = data; // Initialize filtered data
    renderMahallaTable(filteredData);
  } catch (error) {
    console.error("Error loading Mahalla data:", error);
    showErrorToast("Failed to load member data");
  }
}

function showMemberModal(show) {
  const modal = document.getElementById("memberModal");
  if (show) {
    // Reset form when opening
    document.getElementById("addMemberForm").reset();
    modal.showModal();
  } else {
    modal.close();
  }
}

function showEditMemberModal(show, memberData = null) {
  const modal = document.getElementById("editMemberModal");
  if (show && memberData) {
    document.getElementById("editMemberId").value = memberData._id;
    document.getElementById("editMemberName").value = memberData.name || '';
    document.getElementById("editMemberPhone").value = memberData.telephone || '';
    document.getElementById("editMemberAddress").value = memberData.address || '';
    modal.showModal();
  } else {
    modal.close();
  }
}

function renderMahallaTable(data) {
  const tableBody = document.getElementById("mahallaTableBody");
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

    // Payment status cell
    const paymentTd = document.createElement("td");
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    months.forEach((month) => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = month.charAt(0).toUpperCase() + month.slice(1);

      const status = member.mahalla_2024?.[month] || "Not Paid";
      btn.classList.add(status === "Paid" ? "btn-success" : "btn-error");

      btn.addEventListener("click", () => handlePaymentClick(btn, member, month));
      paymentTd.appendChild(btn);
    });
    row.appendChild(paymentTd);

    // Actions cell
    const actionTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-info";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => showEditMemberModal(true, member));
    actionTd.appendChild(editBtn);
    row.appendChild(actionTd);

    tableBody.appendChild(row);
  });
}

async function handlePaymentClick(button, member, month) {
  button.classList.remove("btn-error", "btn-success");
  button.innerHTML = `<span class="loading loading-spinner"></span>`;

  try {
    await window.api.updateMemberStatus(member._id, month, "Paid", LOCATION);
    button.classList.add("btn-success");
  } catch (error) {
    console.error("Error updating payment status:", error);
    button.classList.add("btn-error");
    showErrorToast("Failed to update payment status");
  } finally {
    button.textContent = month.charAt(0).toUpperCase() + month.slice(1);
  }
}

// Form submission handlers
document.getElementById("addMemberForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  if (!selectedLocation) {
    showErrorToast("Please select a location first!");
    return;
  }
  
  const memberData = {
    name: document.getElementById("memberName").value.trim(),
    telephone: document.getElementById("memberPhone").value.trim(),
    address: document.getElementById("memberAddress").value.trim(),
    location: selectedLocation  // Use selectedLocation instead of LOCATION constant
  };

  try {
    console.log("Adding member to location:", selectedLocation);
    const result = await window.api.addMember(memberData);
    if (result.success) {
      showMemberModal(false);
      event.target.reset();
      await loadLocation(selectedLocation); // Reload the current location's data
      showSuccessToast("Member added successfully");
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error adding member:", error);
    showErrorToast(error.message || "Failed to add member");
  }
});

document.getElementById("editMemberForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const memberData = {
    _id: document.getElementById("editMemberId").value,
    name: document.getElementById("editMemberName").value,
    telephone: document.getElementById("editMemberPhone").value,
    address: document.getElementById("editMemberAddress").value,
    location: selectedLocation  // Use selectedLocation instead of LOCATION constant
  };

  try {
    const result = await window.api.updateMember(memberData);
    if (result.success) {
      showEditMemberModal(false);
      await loadLocation(selectedLocation); // Reload the current location's data
      showSuccessToast("Member updated successfully");
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error updating member:", error);
    showErrorToast(error.message || "Failed to update member");
  }
});

// Toast helper functions
function showSuccessToast(message) {
  const toast = document.createElement("div");
  toast.className = "alert alert-success fixed bottom-4 right-4";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showErrorToast(message) {
  const toast = document.createElement("div");
  toast.className = "alert alert-error fixed bottom-4 right-4";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000); // Fixed missing dot between toast and remove()
}

function showLocationModal(show) {
  const locationModal = document.getElementById("locationModal");
  if (show) {
    locationModal.showModal();
  } else {
    locationModal.close();
  }
}

async function loadLocation(location) {
  try {
    selectedLocation = location;
    updateHeaderText(location);
    const data = await window.api.fetchMembers(location);
    mahallaData = data;
    filteredData = data;
    renderMahallaTable(data);
  } catch (error) {
    console.error("Error loading location:", error);
    showErrorToast("Failed to load location data");
  }
}

function updateHeaderText(locationTxt) {
  const locationHeader = document.getElementById("locationHeader");
  showLocationModal(false);
  if (locationHeader) {
    locationHeader.innerText = locationTxt;
  }
}
