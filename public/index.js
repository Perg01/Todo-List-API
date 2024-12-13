document.addEventListener("DOMContentLoaded", async () => {

    const registerButton = document.getElementById("register-button");
    const loginButton = document.getElementById("login-button");
    const authSection = document.getElementById("auth-section");
    const todoSection = document.getElementById("todo-section");
    const previousPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");
    const todoList = document.getElementById("todo-list");
    const logoutButton = document.getElementById("logout-button");
    const logoutSection = document.getElementById("logout-section");

    let currentPage = 1;
    const todosPerPage = 10;

    nextPage.addEventListener("click", () => {
        currentPage++;
        fetchTodos(currentPage);
    });

    previousPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchTodos(currentPage);
        }
    });

    registerButton.addEventListener("click", () => {
        window.location.href = "./register.html";
    });

    loginButton.addEventListener("click", () => {
        window.location.href = "./login.html";
    });

    logoutButton.addEventListener("click", () => {
        logout();
    });

    async function logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Logout successful');
                checkLoginStatus();
                window.location.href = '/index.html';

                if (data.loggedIn) {
                    console.log('User is authenticated', data.user);
                    logoutButton.classList.add('hidden');
                } else {
                    logoutButton.classList.remove('hidden');
                }
            }

        } catch (error) {
            console.error('Error logging out:', error);

        }
    }

    async function fetchTodos(page = 1) {
        try {
            const response = await fetch(`/api/todos?page=${page}&limit=${todosPerPage}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error("Failed to fetch todos");
            }

            const data = await response.json();
            renderTodos(data.todos);
            togglePageButtons(data.page, data.total, data.limit);

        } catch (error) {
            console.error('Error fetching data:', error);
            todoList.innerHTML = '<li>Error fetching data</li>';
        }
    }

    async function checkLoginStatus() {
        try {
            const res = await fetch('/api/auth/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies in the request
            });

            if (res.ok) {
                const data = await res.json();

                if (data.loggedIn) {
                    console.log('User is authenticated', data.user);
                    authSection.classList.add('hidden');
                    todoSection.classList.remove('hidden');
                    fetchTodos();
                } else {
                    console.log('User not logged in');
                    authSection.classList.remove('hidden');
                    todoSection.classList.add('hidden');
                }
            } else {
                throw new Error('Failed to check login status');
            }

        } catch (error) {
            console.error('Error checking login status:', error);
            authSection.classList.remove('hidden');
            todoSection.classList.add('hidden');
        }
    }

    function togglePageButtons(page, total, limit) {
        previousPage.disabled = page <= 1;
        nextPage.disabled = page * limit >= total;
    }
    function renderTodos(todos) {
        const todoList = document.getElementById('todo-list');
        todoList.innerHTML = '';

        if (todos.length === 0) {
            todoList.innerHTML = '<li>No todos yet</li>';
            return;
        }
        todos.forEach((todo) => {
            // const task = document.createElement('a');
            const li = document.createElement('li');
            li.textContent = `${todo.id}: ${todo.title} | ${todo.description}`;
            todoList.appendChild(li);
        });
    }

    await checkLoginStatus();
});