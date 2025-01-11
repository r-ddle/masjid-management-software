function showMemberModal(show) {
  const memberModal = document.getElementById("memberModal");
  if (show) {
    memberModal.showModal();
  } else {
    memberModal.close();
  }
}

let hiflData = [];
const selectedLocation = "Hifle Madarasa";

async function loadHiflData() {
  try {
    const data = await window.api.fetchMembers(selectedLocation);
    console.log("Fetched Hifl data:", data);
    hiflData = data;
    renderHiflTable(data);
  } catch (error) {
    console.error("Error loading Hifl data:", error);
  }
}

function renderHiflTable(data) {
  const tableBody = document.getElementById("hiflTableBody");
  tableBody.innerHTML = "";

  data.forEach((student) => {
    const row = document.createElement("tr");

    // Name cell
    const nameTd = document.createElement("td");
    nameTd.textContent = student.name || "";
    row.appendChild(nameTd);

    // Address cell
    const addressTd = document.createElement("td");
    addressTd.textContent = student.address || "";
    row.appendChild(addressTd);

    // Telephone cell
    const telephoneTd = document.createElement("td");
    telephoneTd.textContent = student.telephone || "";
    row.appendChild(telephoneTd);

    // Payment status (months)
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

    async function updateMember() {
      const id = document.getElementById("edit_member_id").value;
      const name = document.getElementById("edit_member_name").value;
      const address = document.getElementById("edit_member_address").value;
      const phone = document.getElementById("edit_member_phone").value;

      const result = await window.api.updateMember({
        _id: id,
        name,
        address,
        phone,
      });

      if (result.success) {
        closeEditMemberModal();
        await loadLocation(selectedLocation);

        showToast("Member updated successfully!", "success");
        setTimeout(() => toast.remove(), 3000);
      } else {
        throw new Error(result?.message || "Failed to update member");
      }
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

    months.forEach((month) => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = month.charAt(0).toUpperCase() + month.slice(1);

      const status = student.hifl_2024?.[month] || "Not Paid";

      if (status === "Paid") {
        btn.classList.add("btn-success");
      } else if (status === "Not Paid") {
        btn.classList.add("btn-error");
      }

      btn.addEventListener("click", () =>
        handleMonthButtonClick(btn, student, month, selectedLocation)
      );

      paymentTd.appendChild(btn);
    });
    row.appendChild(paymentTd);

    // Actions cell
    const actionTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-info";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditMemberModal(true, student));
    actionTd.appendChild(editBtn);
    row.appendChild(actionTd);

    tableBody.appendChild(row);
  });
}

async function handleMonthButtonClick(button, student, month, location) {
  button.classList.remove("btn-error", "btn-success");
  button.innerText = "Loading...";

  setTimeout(async () => {
    try {
      const updatedStatus = "Paid";
      await window.api.updateMemberStatus(
        student._id,
        month,
        updatedStatus,
        location
      );

      button.classList.add("btn-success");
      button.innerText = month.charAt(0).toUpperCase() + month.slice(1);
    } catch (error) {
      console.error("Error updating student status: ", error);
      button.classList.add("btn-error");
      button.innerText = "Error";
    }
  }, 2000);
}

// Initialize the table when the page loads
document.addEventListener("DOMContentLoaded", loadHiflData);

document
  .getElementById("addMemberModel")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("memberName").value;
    const address = document.getElementById("memberAddress").value;

    try {
      if (!window.api?.addMember) {
        throw new Error("Member creation functionality not available");
      }

      const result = await window.api.addMember({
        name,
        address,
        location: selectedLocation,
      });

      if (result && result.success) {
        showMemberModal(false);
        event.target.reset();
        await loadHiflData(); // Refresh the table

        const toast = document.createElement("div");
        toast.className = "alert alert-success fixed bottom-4 right-4";
        toast.textContent = "Student added successfully!";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      } else {
        throw new Error(result?.message || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      const toast = document.createElement("div");
      toast.className = "alert alert-error fixed bottom-4 right-4";
      toast.textContent =
        error.message || "Error adding student. Please try again.";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  });

function addHiflMember() {
  const name = document.getElementById("memberName").value.trim();
  const telephone = document.getElementById("memberPhone").value.trim();
  const address = document.getElementById("memberAddress").value.trim();

  if (!name || !telephone || !address) {
    showErrorToast("All fields are required!");
    return;
  }

  const data = {
    name,
    telephone,
    address,
    location: "Hifle Madarasa",
  };

  window.api
    .invoke("add-member", data)
    .then((result) => {
      if (result.success) {
        showSuccessToast("Member added successfully!");
        loadHiflData();
      } else {
        showErrorToast(result.message || "Failed to add member");
      }
    })
    .catch((error) => {
      console.error("Error adding member:", error);
      showErrorToast("Error adding member. Please try again.");
    });
}

function updateHiflMember(memberId) {
  const name = document.getElementById("MemberName").value.trim();
  const telephone = document.getElementById("MemberTelephone").value.trim();
  const address = document.getElementById("MemberAddress").value.trim();

  if (!name || !telephone || !address) {
    showErrorToast("All fields are required!");
    return;
  }

  const data = {
    _id: memberId,
    name,
    telephone,
    address,
    location: "Hifle Madarasa",
  };

  window.api
    .invoke("update-member", data)
    .then((result) => {
      if (result.success) {
        showSuccessToast("Member updated successfully!");
        loadHiflData();
      } else {
        showErrorToast(result.message || "Failed to update member");
      }
    })
    .catch((error) => {
      console.error("Error updating member:", error);
      showErrorToast("Error updating member. Please try again.");
    });
}

function deleteHiflMember(memberId) {
  if (!confirm("Are you sure you want to delete this member?")) return;

  window.api
    .invoke("delete-member", { _id: memberId, location: "Hifle Madarasa" })
    .then((result) => {
      if (result.success) {
        showSuccessToast("Member deleted successfully!");
        loadHiflData();
      } else {
        showErrorToast(result.message || "Failed to delete member");
      }
    })
    .catch((error) => {
      console.error("Error deleting member:", error);
      showErrorToast("Error deleting member. Please try again.");
    });
}

function openAddMemberModal() {
  document.getElementById("memberModal").showModal();
}

function closeAddMemberModal() {
  document.getElementById("memberModal").close();
}

function openEditMemberModal(member) {
  document.getElementById("editMemberName").value = member.name;
  document.getElementById("editMemberAddress").value = member.address;
  document.getElementById("editMemberPhone").value = member.phone;
  document.getElementById("editMemberModal").showModal();
}

function closeEditMemberModal() {
  document.getElementById("editMemberModal").close();
}
