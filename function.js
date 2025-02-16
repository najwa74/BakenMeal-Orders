// Inisialisasi Firebase
const db = firebase.database().ref("todos");

// Cek apakah ada data di localStorage
let todoList = JSON.parse(localStorage.getItem("todoList")) || [];

// Simpan ke localStorage
function saveTodoList() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
}

// Tambah To-Do
function addTodo(event) {
    event.preventDefault();
    const name = document.getElementById("todoName").value;
    const menu = document.getElementById("todoMenu").value;
    const pengambilan = document.getElementById("todoOpsi").value;
    const notes = document.getElementById("todoNotes").value;

    const newTodo = { 
        name, 
        menu, 
        status: false, 
        pengambilan, 
        notes, 
        timestamp: Date.now() 
    };

    // Simpan ke Firebase
    db.push(newTodo);

    // Reset form tanpa perlu update manual ke todoList
    document.getElementById("addTodoForm").reset();
}

// Menampilkan To-Do List dengan Sorting Status
function displayTodos() {
    const tableBody = document.querySelector("#todoTable tbody");
    tableBody.innerHTML = "";

    // Sorting: Belum selesai di atas, selesai di bawah
    todoList.sort((a, b) => a.status - b.status || a.timestamp - b.timestamp);

    todoList.forEach((todo, index) => {
        const row = document.createElement("tr");
        row.style.backgroundColor = todo.pengambilan === "Stand 14" ? "#d4edda" : "#ffcccc";

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${todo.name}</td>
            <td>${todo.menu}</td>
            <td><input type="checkbox" ${todo.status ? "checked" : ""} onclick="toggleStatus('${todo.key}')"></td>
            <td>${todo.pengambilan}</td>
            <td>${todo.notes}</td>
            <td>
                <button onclick="editTodo('${todo.key}')">Edit</button>
                <button onclick="removeTodo('${todo.key}')">Hapus</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Mengubah Status To-Do
function toggleStatus(key) {
    const todo = todoList.find(t => t.key === key);
    if (todo) {
        todo.status = !todo.status;
        todo.timestamp = Date.now();
        db.child(key).update({ status: todo.status, timestamp: todo.timestamp });

        saveTodoList();
        displayTodos();
    }
}

// Edit To-Do
function editTodo(key) {
    const todo = todoList.find(t => t.key === key);
    if (!todo) return;

    const newName = prompt("Nama Pembeli:", todo.name);
    const newMenu = prompt("Menu:", todo.menu);
    const newNotes = prompt("Catatan:", todo.notes);

    if (newName !== null && newMenu !== null && newNotes !== null) {
        db.child(key).update({ name: newName, menu: newMenu, notes: newNotes });

        saveTodoList();
        displayTodos();
    }
}

// Hapus To-Do
function removeTodo(key) {
    if (confirm("Yakin mau dihapus?")) {
        db.child(key).remove();

        todoList = todoList.filter(t => t.key !== key);
        saveTodoList();
        displayTodos();
    }
}

// Sinkronisasi Firebase dengan localStorage
db.on("value", snapshot => {
    todoList = [];
    snapshot.forEach(childSnapshot => {
        const todo = childSnapshot.val();
        todo.key = childSnapshot.key;
        todoList.push(todo);
    });
    saveTodoList();
    displayTodos();
});

// Event listener untuk form
document.getElementById("addTodoForm").addEventListener("submit", addTodo);

// Tampilkan data awal
displayTodos();
