// ? Select Location Model
function showLocationModal(show) {
  const locationModal = document.getElementById("locationModal");
  if (show) {
    locationModal.showModal();
  } else {
    locationModal.close();
  }
}

// Add at the top with other functions
function showAdminModal(show) {
  const adminModal = document.getElementById("adminModal");
  if (show) {
    adminModal.showModal();
  } else {
    adminModal.close();
  }
}

// ...existing code...

function showMemberModal(show) {
  const memberModal = document.getElementById("memberModal");
  if (show) {
    memberModal.showModal();
  } else {
    memberModal.close();
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
    editBtn.addEventListener("click", () => showEditMemberModal(true, member));
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

// Add after existing initialization code
document.getElementById("addAdminForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;
  
  try {
    if (!window.api?.createAdmin) {
      throw new Error("Admin creation functionality not available");
    }
    
    const result = await window.api.createAdmin(username, password);
    if (result.success) {
      showAdminModal(false);
      event.target.reset();
      const toast = document.createElement("div");
      toast.className = "alert alert-success fixed bottom-4 right-4";
      toast.textContent = "Admin created successfully!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } else {
      throw new Error(result.message || "Failed to create admin");
    }
  } catch (error) {
    console.error("Error creating admin:", error);
    const toast = document.createElement("div");
    toast.className = "alert alert-error fixed bottom-4 right-4";
    toast.textContent = error.message || "Error creating admin. Please try again.";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});

// Add after existing form handlers
document.getElementById("addMemberForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  if (!selectedLocation) {
    const toast = document.createElement("div");
    toast.className = "alert alert-error fixed bottom-4 right-4";
    toast.textContent = "Please select a location first!";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    return;
  }
  
  const name = document.getElementById("memberName").value;
  const telephone = document.getElementById("memberPhone").value;
  const address = document.getElementById("memberAddress").value;
  
  try {
    if (!window.api?.addMember) {
      throw new Error("Member creation functionality not available");
    }

    // Add logging
    console.log("Sending member data:", {
      name,
      telephone,
      address,
      location: selectedLocation
    });
    
    const result = await window.api.addMember({
      name,
      telephone,
      address,
      location: selectedLocation
    });

    console.log("Add member response:", result); // Add logging
    
    if (result && result.success) {
      showMemberModal(false);
      event.target.reset();
      await loadLocation(selectedLocation); // Refresh the table with await
      
      const toast = document.createElement("div");
      toast.className = "alert alert-success fixed bottom-4 right-4";
      toast.textContent = "Member added successfully!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } else {
      throw new Error(result?.message || "Failed to add member");
    }
  } catch (error) {
    console.error("Error adding member:", error);
    const toast = document.createElement("div");
    toast.className = "alert alert-error fixed bottom-4 right-4";
    toast.textContent = error.message || "Error adding member. Please try again.";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});

// Add these functions to handle the edit functionality
function showEditMemberModal(show, memberData = null) {
  const editModal = document.getElementById("editMemberModal");
  if (show && memberData) {
    console.log("Raw member data:", memberData);
    // Get the ID string, handling both string and ObjectId cases
    const idString = typeof memberData._id === 'string' ? 
      memberData._id : 
      memberData._id.toString();
    console.log("Extracted ID string:", idString);
    
    document.getElementById("editMemberId").value = idString;
    document.getElementById("editMemberName").value = memberData.name || '';
    document.getElementById("editMemberPhone").value = memberData.telephone || '';
    document.getElementById("editMemberAddress").value = memberData.address || '';
    editModal.showModal();
  } else {
    editModal.close();
  }
}

// Update the edit form submission handler
document.getElementById("editMemberForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  let memberId;
  let result;
  
  try {
    if (!selectedLocation) {
      throw new Error("No location selected");
    }

    memberId = document.getElementById("editMemberId").value;
    console.log("Raw member ID from form:", memberId);
    
    // Basic validation of the ID format
    const cleanId = memberId.trim();
    if (!cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid ID format:", cleanId);
      throw new Error("Invalid member ID format");
    }

    const updateData = {
      _id: cleanId,
      name: document.getElementById("editMemberName").value.trim(),
      telephone: document.getElementById("editMemberPhone").value.trim(),
      address: document.getElementById("editMemberAddress").value.trim(),
      location: selectedLocation
    };

    console.log("Sending update data:", updateData);
    result = await window.api.updateMember(updateData);
    
    if (result && result.success) {
      showEditMemberModal(false);
      await loadLocation(selectedLocation);
      
      const toast = document.createElement("div");
      toast.className = "alert alert-success fixed bottom-4 right-4";
      toast.textContent = "Member updated successfully!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } else {
      throw new Error(result?.message || "Failed to update member");
    }
  } catch (error) {
    console.error("Error updating member:", error);
    console.log("Failed update for ID:", memberId);
    
    const toast = document.createElement("div");
    toast.className = "alert alert-error fixed bottom-4 right-4";
    toast.textContent = error.message || "Error updating member. Please try again.";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
