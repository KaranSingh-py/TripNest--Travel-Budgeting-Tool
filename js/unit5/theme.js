/* UNIT V: SHARED LIGHT/DARK THEME */
(function applySavedThemeEarly() {
    let theme = "light";
    try {
        const saved = localStorage.getItem("tripnest-theme");
        if (saved === "light" || saved === "dark") theme = saved;
    } catch (error) {
        console.warn("Theme preference could not be read:", error);
    }
    document.documentElement.setAttribute("data-theme", theme);
})();
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("#themeToggleBtn").forEach(function(button) {
        const updateLabel = function() {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            button.setAttribute("aria-label", current === "dark" ? "Switch to light theme" : "Switch to dark theme");
            button.setAttribute("aria-pressed", current === "dark" ? "true" : "false");
        };
        updateLabel();
        button.addEventListener("click", function() {
            const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            try { localStorage.setItem("tripnest-theme", next); }
            catch (error) { console.error("Could not persist theme preference:", error); }
            const user = typeof AppStorage !== "undefined" ? AppStorage.getActiveUser() : null;
            if (user && user.preferences) {
                user.preferences.theme = next;
                const records = AppStorage.readRecords("tbt_users");
                const index = records.findIndex(function(item) { return item.id === user.id; });
                if (index >= 0) {
                    records[index] = user;
                    AppStorage.saveRecords("tbt_users", records);
                    AppStorage.setActiveUser(user);
                }
            }
            document.querySelectorAll("#themeToggleBtn").forEach(function(item) {
                item.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
                item.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
            });
        });
    });
});
