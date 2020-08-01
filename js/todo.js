document.addEventListener("DOMContentLoaded", () => {
  const request = window.indexedDB.open("todoList", 1);
  const listEl = document.getElementById("todo-list");
  let db;
  request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore("todos", { autoIncrement: true });
  };
  request.onsuccess = (e) => {
    db = e.target.result;
    viewTodos();
  };

  const addTodo = () => {
    const toDoEl = document.getElementById("todo-text");
    const toDoText = toDoEl.value;
    const tx = db.transaction(["todos"], "readwrite");
    tx.onerror = (e) => alert(`Error: ${e.target.error}`);
    todoList = tx.objectStore("todos");
    todoList.add({ text: toDoText, completed: false });
    viewTodos();
  };

  const viewTodos = () => {
    listEl.innerHTML = "";
    const newListParentEl = document.createElement("ul");
    const tx = db.transaction("todos", "readonly");
    const todos = tx.objectStore("todos");
    const request = todos.openCursor();
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const newListEl = document.createElement("li");
        const newListTextEl = document.createElement("div");
        const deleteBtnEl = document.createElement("span");
        deleteBtnEl.classList.add("delete");
        deleteBtnEl.setAttribute("data-list-id", cursor.key);
        deleteBtnEl.textContent = "X";
        newListTextEl.classList.add("todo");
        newListTextEl.setAttribute("data-list-id", cursor.key);
        newListTextEl.textContent = cursor.value.text;
        if (cursor.value.completed) {
          newListTextEl.classList.add("completed");
        }
        newListEl.appendChild(newListTextEl);
        newListEl.appendChild(deleteBtnEl);
        newListParentEl.appendChild(newListEl);
        cursor.continue();
      }
      listEl.appendChild(newListParentEl);
    };
  };

  const btnAddTodo = document.getElementById("btnAddTodo");
  btnAddTodo.addEventListener("click", addTodo);

  listEl.addEventListener("click", (e) => {
    const id = Number(e.target.getAttribute("data-list-id"));
    const completed = e.target.classList.contains("completed");
    const tx = db.transaction(["todos"], "readwrite");
    let request;
    tx.onerror = (e) => alert(`Error: ${e.target.error}`);
    todoList = tx.objectStore("todos");
    if (e.target.nodeName === "SPAN") {
      request = todoList.delete(id);
    } else {
      request = todoList.put(
        {
          text: e.target.textContent,
          completed: !completed,
        },
        id
      );
    }

    request.onsuccess = (e) => {
      viewTodos();
    };
  });
});
