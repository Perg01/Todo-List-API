document.addEventListener("DOMContentLoaded", () => {

    const registerButton = document.getElementById("register-button");
    const loginButton = document.getElementById("login-button");
    const authSection = document.getElementById("auth-section");
    const todoSection = document.getElementById("todo-section");

    registerButton.addEventListener("click", () => {
        window.location.href = "./register.html";
    });
});