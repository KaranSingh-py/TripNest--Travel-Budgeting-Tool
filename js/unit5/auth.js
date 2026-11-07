/* UNIT V: AUTHENTICATION AND CLIENT-SIDE ROLE CHECKS
   Academic demo only: browser storage is editable and is not secure authentication. */
document.addEventListener("DOMContentLoaded", function() {
    const page = document.body.dataset.page || "";
    let activeUser = AppStorage.getActiveUser();
    const users = AppStorage.readRecords("tbt_users");

    // Revalidate the session against the stored account; never trust a role copied only into sessionStorage.
    if (activeUser) {
        const storedUser = users.find(function(user) { return user.id === activeUser.id && user.email === activeUser.email; });
        if (!storedUser || storedUser.status === "disabled") {
            AppStorage.clearSession();
            activeUser = null;
        } else {
            activeUser = storedUser;
            AppStorage.setActiveUser(storedUser);
        }
    }

    const publicPages = ["landing", "login", "register"];
    if (!activeUser && !publicPages.includes(page)) {
        window.location.replace("./login.html");
        return;
    }

    const isAdmin = !!activeUser && activeUser.role === "admin";
    if (page === "admin" && !isAdmin) {
        alert("Access denied. Administrator privileges are required.");
        window.location.replace(activeUser ? "./dashboard.html" : "./login.html");
        return;
    }

    document.querySelectorAll('a[href="./admin.html"]').forEach(function(link) {
        if (!isAdmin) {
            const parent = link.closest("li") || link;
            parent.hidden = true;
        }
    });

    if (activeUser) {
        const nameEl = document.getElementById("sidebarUserName");
        const currencyEl = document.getElementById("sidebarUserCurrency");
        if (nameEl) nameEl.textContent = activeUser.name;
        if (currencyEl) currencyEl.textContent = "Home: " + (activeUser.homeCurrency || "INR");
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const name = document.getElementById("regName")?.value.trim() || "";
            const email = (document.getElementById("regEmail")?.value || "").trim().toLowerCase();
            const password = document.getElementById("regPassword")?.value || "";
            const confirmPassword = document.getElementById("regConfirmPassword")?.value || "";
            const currency = document.getElementById("regCurrency")?.value || "INR";
            const style = document.getElementById("regBudgetStyle")?.value || "moderate";

            if (name.length < 2) return alert("Enter your name (at least 2 characters).");
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Enter a valid email address.");
            if (password.length < 8) return alert("Password must contain at least 8 characters.");
            if (password !== confirmPassword) return alert("Passwords do not match.");

            const allUsers = AppStorage.readRecords("tbt_users");
            if (allUsers.some(function(user) { return user.email.toLowerCase() === email; })) {
                return alert("An account with this email already exists.");
            }

            const newUser = createNewUserObject("usr_" + Date.now(), name, email, password, currency, style);
            newUser.role = "user";
            newUser.status = "active";
            if (!AppStorage.saveRecords("tbt_users", allUsers.concat([newUser]))) return;
            alert("Registration successful. Please log in.");
            window.location.href = "./login.html";
        });
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = (document.getElementById("loginEmail")?.value || "").trim().toLowerCase();
            const password = document.getElementById("loginPassword")?.value || "";
            const currentUsers = AppStorage.readRecords("tbt_users");
            const user = currentUsers.find(function(item) {
                return item.email.toLowerCase() === email && item.passwordDemo === password && item.status !== "disabled";
            });
            if (!user) return alert("Invalid credentials or account disabled.");
            if (!AppStorage.setActiveUser(user)) return;
            window.location.href = user.role === "admin" ? "./admin.html" : "./dashboard.html";
        });
    }

    document.querySelectorAll("#logoutBtn, .logout-btn").forEach(function(button) {
        button.addEventListener("click", function(event) {
            event.preventDefault();
            AppStorage.clearSession();
            window.location.href = "./login.html";
        });
    });
});
