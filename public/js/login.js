document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    // Handle manual login form submission
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful");
                window.location.href = "/index.html";
            } else {
                alert(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed, try again");
        }
    });

    // Google OAuth login
    window.onload = () => {
        google.accounts.id.initialize({
            client_id: process.env.GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    const res = await fetch("/auth/google", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token: response.credential }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        console.log("Login successful: ", data);
                        alert("Login successful: ", data.message);
                        window.location.href = "/auth/google"; // /index.html
                    } else {
                        console.error("Login failed:", data);
                        alert("Login failed:", data.message);
                    }

                } catch (error) {
                    console.error("Login error:", error);
                    alert("Login failed, try again", error);
                }
            },
        });

        google.accounts.id.renderButton(
            document.querySelector(".g_id_signin"),
            { theme: "outline", size: "large", text: "signin_with", logo_alignment: "rectangular" }
        );

        google.accounts.id.prompt();
    };
});

