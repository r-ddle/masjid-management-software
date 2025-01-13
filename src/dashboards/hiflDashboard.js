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
        // Show loading state
        const tableBody = document.getElementById("hiflTableBody");
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <span class="loading loading-spinner"></span> Loading students...
                </td>
            </tr>
        `;

        const data = await window.api.fetchMembers(selectedLocation);
        console.log("Fetched Hifl data:", data);
        hiflData = data;
        renderHiflTable(data);
    } catch (error) {
        console.error("Error loading Hifl data:", error);
        const tableBody = document.getElementById("hiflTableBody");
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-error">
                    Error loading students. Please try again.
                </td>
            </tr>
        `;
    }
}

let lastClickTime = 0;
const COOLDOWN_PERIOD = 2000; // 2 seconds cooldown

async function handleMonthButtonClick(button, student, month) {
  // Implement cooldown to prevent rapid clicks
  const currentTime = Date.now();
  if (currentTime - lastClickTime < COOLDOWN_PERIOD) {
    console.log("Cooldown period active. Please wait.");
    return;
  }
  lastClickTime = currentTime;

  button.classList.remove("btn-error", "btn-success");
  button.innerHTML = `<span class="loading loading-spinner"></span>`;

  try {
    const currentStatus = student.hifl_2024?.[month.toLowerCase()] || "Not Paid";
    const updatedStatus = currentStatus === "Paid" ? "Not Paid" : "Paid";
    const memberId = student._id;

    console.log("Making updateMemberStatus call:", {
      memberId,
      month,
      updatedStatus,
      selectedLocation
    });

    const result = await window.api.updateMemberStatus(
      memberId,
      month,
      updatedStatus,
      selectedLocation
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to update status");
    }

    button.classList.add(updatedStatus === "Paid" ? "btn-success" : "btn-error");
    button.textContent = month.charAt(0).toUpperCase() + month.slice(1);

    // Refresh data
    const updatedData = await window.api.fetchMembers(selectedLocation);
    hiflData = updatedData;
    renderHiflTable(updatedData);

  } catch (error) {
    console.error("Error updating payment status:", error);
    button.classList.add("btn-error");
    button.textContent = month.charAt(0).toUpperCase() + month.slice(1);
    const toast = document.createElement("div");
    toast.className = "alert alert-error fixed bottom-4 right-4";
    toast.textContent = `Failed to update payment status: ${error.message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

function renderHiflTable(data) {
    const tableBody = document.getElementById("hiflTableBody");
    tableBody.innerHTML = "";

    //render the selected (id) row data
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


        const telephoneTd = document.createElement("td");
        telephoneTd.textContent = student.telephone || "";
        row.appendChild(telephoneTd);

        // Payment status (months)
        const paymentTd = document.createElement("td");
        const months = ["jan", "feb", "mar", "apr", "may", "jun", 
                       "jul", "aug", "sep", "oct", "nov", "dec"];

        months.forEach((month) => {
            const btn = document.createElement("button");
            btn.className = "btn";
            btn.textContent = month.charAt(0).toUpperCase() + month.slice(1);

            const status = student.hifl_2024?.[month] || "Not Paid";
            btn.classList.add(status === "Paid" ? "btn-success" : "btn-error");

            btn.addEventListener("click", () => handleMonthButtonClick(btn, student, month));
            paymentTd.appendChild(btn);
        });
        row.appendChild(paymentTd);

        // Actions cell
        const actionTd = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-info";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => showEditMemberModal(true, student));
        actionTd.appendChild(editBtn);
        row.appendChild(actionTd);

        tableBody.appendChild(row);
    });
}

// Initialize the table when the page loads
document.addEventListener("DOMContentLoaded", loadHiflData);

// Add search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  
  const filteredData = hiflData.filter(student => 
    student.name?.toLowerCase().includes(searchTerm) ||
    student.address?.toLowerCase().includes(searchTerm) ||
    student.telephone?.toLowerCase().includes(searchTerm)
  );
  
  renderHiflTable(filteredData);
});

document.getElementById("addMemberForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const memberData = {
    name: document.getElementById("memberName").value.trim(),
    telephone: document.getElementById("memberPhone").value.trim(),
    address: document.getElementById("memberAddress").value.trim(),
    location: selectedLocation
  };
  
  try {
    const result = await window.api.addMember(memberData);
    if (result.success) {
      showMemberModal(false);
      event.target.reset();
      
      // Show success toast
      const toast = document.createElement("div");
      toast.className = "alert alert-success fixed bottom-4 right-4";
      toast.textContent = "Student added successfully!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      // Refresh the table
      await loadHiflData();
    } else {
      throw new Error(result.message || "Failed to add student");
    }
  } catch (error) {
    console.error("Error adding student:", error);
    const toast = document.createElement("div");
    toast.className = "alert alert-error fixed bottom-4 right-4";
    toast.textContent = error.message || "Error adding student. Please try again.";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});

function showEditMemberModal(show, memberData = null) {
  const editModal = document.getElementById("editMemberModal");
  if (show && memberData) {
    console.log("Raw student data:", memberData);
    // Get the ID string, handling both string and ObjectId cases
    const idString = typeof memberData._id === "string" ? 
      memberData._id : 
      memberData._id.toString();
    console.log("Extracted ID string:", idString);

    document.getElementById("editMemberId").value = idString;
    document.getElementById("editMemberName").value = memberData.name || "";
    document.getElementById("editMemberPhone").value = memberData.telephone || "";
    document.getElementById("editMemberAddress").value = memberData.address || "";
    editModal.showModal();
  } else {
    editModal.close();
  }
}

// Add edit form submission handler
document.getElementById("editMemberForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const memberData = {
    _id: document.getElementById("editMemberId").value,
    name: document.getElementById("editMemberName").value,
    telephone: document.getElementById("editMemberPhone").value,
    address: document.getElementById("editMemberAddress").value,
    location: selectedLocation
  };

  try {
    const result = await window.api.updateMember(memberData);
    if (result.success) {
      showEditMemberModal(false);
      await loadHiflData(); // Refresh table
      const toast = document.createElement("div");
      toast.className = "alert alert-success fixed bottom-4 right-4";
      toast.textContent = "Student updated successfully!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } else {
      throw new Error(result.message || "Failed to update student");
    }
  } catch (error) {
    console.error("Error updating student:", error);
    const toast = document.createElement("div");
    toast.className = "alert alert-error fixed bottom-4 right-4";
    toast.textContent = error.message || "Error updating student";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});

// Add delete functionality
async function deleteMember() {
  const id = document.getElementById("editMemberId").value;
  if (!id) {
    console.error("No student ID found");
    const toast = document.createElement("div");
    toast.className = "alert alert-error fixed bottom-4 right-4";
    toast.textContent = "No student ID found";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    return;
  }

  try {
    console.log("Deleting student with ID:", id);
    const result = await window.api.deleteMember(id);

    if (result.success) {
      showEditMemberModal(false);
      await loadHiflData(); // Refresh table
      const toast = document.createElement("div");
      toast.className = "alert alert-success fixed bottom-4 right-4";
      toast.textContent = "Student deleted successfully!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } else {
      throw new Error(result.message || "Failed to delete student");
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    const toast = document.createElement("div");
    toast.className = "alert alert-error fixed bottom-4 right-4";
    toast.textContent = error.message || "Error deleting student";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}
