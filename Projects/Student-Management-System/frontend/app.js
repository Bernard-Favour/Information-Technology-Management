// ========================================
// Student Management System
// JavaScript
// ========================================

// Store students temporarily in memory
let students = [];

// Get elements from the HTML
const studentForm = document.getElementById("studentForm");
const searchInput = document.getElementById("searchInput");
const studentTableBody = document.getElementById("studentTableBody");
const studentCount = document.getElementById("studentCount");

studentForm.addEventListener("submit", async function (event) {

    // Prevent the page from refreshing
    event.preventDefault();

    // Get values from the form
    const name = document.getElementById("studentName").value;
    const id = document.getElementById("studentId").value;
    const email = document.getElementById("studentEmail").value;
    const program = document.getElementById("studentProgram").value;

    // Create student object
    const student = {
        id: id,
        name: name,
        email: email,
        program: program
    };

    try {

        // Send student to Flask backend
        const response = await fetch(
            "http://127.0.0.1:5000/api/students",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Request failed (${response.status}).`);
        }

        // Show success message
        alert(data.message);

        // Clear the form
        studentForm.reset();

        // Load students from backend
        await loadStudents();

    } catch (error) {

        console.error("Error:", error);

        alert(`Could not save student: ${error.message}`);
    }
});


async function loadStudents() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/students");

        if (!response.ok) {
            throw new Error(`Request failed (${response.status}).`);
        }

        students = await response.json();
        displayStudents();
        updateStudentCount();
    } catch (error) {
        console.error("Error loading students:", error);
        alert("Could not load students from the backend.");
    }
}


// ========================================
// Display Students
// ========================================

function displayStudents() {

    // Clear the table
    studentTableBody.innerHTML = "";

    // Check if there are no students
    if (students.length === 0) {

        studentTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No students registered yet.
                </td>
            </tr>
        `;

        return;
    }

    // Display each student
    students.forEach(function (student) {

        const row = document.createElement("tr");

        row.innerHTML = `
    <td>${student.id}</td>
    <td>${student.name}</td>
    <td>${student.email}</td>
    <td>${student.program}</td>
    <td>
        <button class="delete-btn" onclick="deleteStudent('${student.id}')">
            Delete
        </button>
    </td>
`;
        studentTableBody.appendChild(row);
    });
}

loadStudents();


// ========================================
// Update Student Count
// ========================================

function updateStudentCount() {

    studentCount.textContent = students.length;
}
async function deleteStudent(studentId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const url = "http://127.0.0.1:5000/api/students/" +
                    encodeURIComponent(studentId);

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                "Server returned status " + response.status
            );
        }

        const data = await response.json();

        alert(data.message);

        await loadStudents();

    } catch (error) {

        console.error("Delete error:", error);

        alert("Failed to delete student. Check the browser console.");

    }
}
searchInput.addEventListener("input", function () {

    const searchTerm = searchInput.value.toLowerCase();

    const filteredStudents = students.filter(function (student) {

        return (
            student.id.toLowerCase().includes(searchTerm) ||
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.program.toLowerCase().includes(searchTerm)
        );

    });

    displaySearchResults(filteredStudents);
});


function displaySearchResults(filteredStudents) {

    studentTableBody.innerHTML = "";

    if (filteredStudents.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No students found.
                </td>
            </tr>
        `;
        return;
    }

    filteredStudents.forEach(function (student) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.program}</td>
            <td>
                <button
                    class="delete-btn"
                    onclick="deleteStudent('${student.id}')">
                    Delete
                </button>
            </td>
        `;

        studentTableBody.appendChild(row);
    });
}
async function loadStudents() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/students"
        );

        const data = await response.json();

        students = data;

        displayStudents();

        updateStudentCount();

    } catch (error) {

        console.error("Error loading students:", error);

    }
}

loadStudents();