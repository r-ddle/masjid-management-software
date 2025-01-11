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

        // Payment status (months)
        const paymentTd = document.createElement("td");
        const months = ["jan", "feb", "mar", "apr", "may", "jun", 
                       "jul", "aug", "sep", "oct", "nov", "dec"];

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
        editBtn.addEventListener("click", () => showEditMemberModal(true, student));
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

document.getElementById("addMemberForm").addEventListener("submit", async (event) => {
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
      location: selectedLocation
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
    toast.textContent = error.message || "Error adding student. Please try again.";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
