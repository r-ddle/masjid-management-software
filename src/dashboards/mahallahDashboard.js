// Improved mahallahDashboard.js
let mahallaData = [];
const selectedLocation = "Mahallah Member Details";

// Initialize data loading on page load
document.addEventListener("DOMContentLoaded", async () => {
  await loadMahallaData();
});

document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredData = mahallaData.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchTerm) ||
      member.address?.toLowerCase().includes(searchTerm) ||
      member.telephone?.toLowerCase().includes(searchTerm)
  );
  renderMahallaTable(filteredData);
});

async function loadMahallaData() {
  try {
    const data = await window.api.fetchMembers(selectedLocation);
    mahallaData = data;
    renderMahallaTable(data);
  } catch (error) {
    console.error("Error loading Mahalla data:", error);
    showErrorToast("Failed to load member data");
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
    const telephoneTd = document.createElement("td");
    telephoneTd.textContent = member.telephone || "";
    row.appendChild(telephoneTd);

    // Payment status cell
    const paymentTd = document.createElement("td");
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
      btn.className = "btn";
      btn.textContent = month.charAt(0).toUpperCase() + month.slice(1);

      const status = member.mahalla_2024?.[month] || "Not Paid";
      btn.classList.add(status === "Paid" ? "btn-success" : "btn-error");

      btn.addEventListener("click", () =>
        handlePaymentClick(btn, member, month)
      );
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
  button.textContent = "Loading...";

  try {
    await window.api.updateMemberStatus(
      member._id,
      month,
      "Paid",
      selectedLocation
    );
    button.classList.add("btn-success");
  } catch (error) {
    console.error("Error updating payment status:", error);
    button.classList.add("btn-error");
    showErrorToast("Failed to update payment status");
  } finally {
    button.textContent = month.charAt(0).toUpperCase() + month.slice(1);
  }
}

function showMemberModal(show) {
  const modal = document.getElementById("memberModal");
  if (show) {
    document.getElementById("addMemberForm").reset();
    modal.showModal();
  } else {
    modal.close();
  }
}

function showEditMemberModal(show, memberData = null) {
  const editModal = document.getElementById("editMemberModal");
  if (show && memberData) {
    console.log("Raw member data:", memberData);
    // Get the ID string, handling both string and ObjectId cases
    const idString =
      typeof memberData._id === "string"
        ? memberData._id
        : memberData._id.toString();
    console.log("Extracted ID string:", idString);

    document.getElementById("editMemberId").value = idString;
    document.getElementById("editMemberName").value = memberData.name || "";
    document.getElementById("editMemberPhone").value =
      memberData.telephone || "";
    document.getElementById("editMemberAddress").value =
      memberData.address || "";
    editModal.showModal();
  } else {
    editModal.close();
  }
}

// Form submission handlers

function openAddMemberModal() {
  document.getElementById("memberModal").showModal();
}

function closeAddMemberModal() {
  document.getElementById("memberModal").close();
}

function openEditMemberModal(member) {
  document.getElementById("edit_member_name").value = member.name;
  document.getElementById("edit_member_address").value = member.address;
  document.getElementById("edit_member_phone").value = member.phone;
  document.getElementById("edit_member_id").value = member._id;
  document.getElementById("editMemberModal").showModal();
}

function closeEditMemberModal() {
  document.getElementById("editMemberModal").close();
}

document
  .getElementById("memberModal")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const memberData = {
      name: document.getElementById("memberName").value.trim(),
      telephone: document.getElementById("memberPhone").value.trim(),
      address: document.getElementById("memberAddress").value.trim(),
      location: selectedLocation,
    };

    try {
      const result = await window.api.addMember(memberData);
      if (result.success) {
        closeAddMemberModal();
        await loadMahallaData();
        showSuccessToast("Member added successfully");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error adding member:", error);
      showErrorToast(error.message || "Failed to add member");
    }
  });

document
  .getElementById("editMemberModal")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const memberData = {
      _id: document.getElementById("editMemberId").value,
      name: document.getElementById("editMemberName").value,
      telephone: document.getElementById("editMemberPhone").value,
      address: document.getElementById("editMemberAddress").value,
      location: selectedLocation,
    };

    try {
      const result = await window.api.updateMember(memberData);
      if (result.success) {
        showEditMemberModal(false);
        await loadMahallaData();
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
  setTimeout(() => toast.remove(), 3000);
}

async function deleteMember() {
  const id = document.getElementById("editMemberId").value;

  if (!id) {
    console.error("No member ID found");
    showToast("No member ID found", "error");
    return;
  }

  try {
    console.log("Deleting member with ID:", id);
    const result = await window.api.deleteMember(id);

    if (result.success) {
      console.log("Member deleted:", result);
      closeEditMemberModal();
      window.location.reload(); // Refresh the entire page
      showToast("Member deleted successfully!", "success");
    } else {
      throw new Error(result.message || "Failed to delete member");
    }
  } catch (error) {
    console.error("Error deleting member:", error);
    showToast(error.message || "Error deleting member", "error");
  }
}
