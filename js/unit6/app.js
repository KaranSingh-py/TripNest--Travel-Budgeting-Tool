/* UNIT VI: PAGE-LEVEL APPLICATION INTEGRATION */
document.addEventListener("DOMContentLoaded", function() {
    const user = typeof AppStorage !== "undefined" ? AppStorage.getActiveUser() : null;
    const page = document.body.dataset.page || "";
    if (user && page === "profile") {
        const form = document.getElementById("profileForm");
        const name = document.getElementById("profName");
        const email = document.getElementById("profEmail");
        const currency = document.getElementById("profCurrency");
        const style = document.getElementById("profBudgetStyle");
        if (name) name.value = user.name || "";
        if (email) email.value = user.email || "";
        if (currency) currency.value = user.homeCurrency || "INR";
        if (style) style.value = user.budgetStyle || "moderate";
        if (form) form.addEventListener("submit", function(event) {
            event.preventDefault();
            const records = AppStorage.readRecords("tbt_users");
            const index = records.findIndex(function(item) { return item.id === user.id; });
            if (index < 0) return showAppError("Your account could not be found.");
            records[index].name = name.value.trim();
            records[index].homeCurrency = currency.value;
            records[index].budgetStyle = style.value;
            if (!records[index].preferences) records[index].preferences = {};
            AppStorage.saveRecords("tbt_users", records);
            AppStorage.setActiveUser(records[index]);
            const feedback = document.getElementById("profileFeedback");
            if (feedback) { feedback.textContent = "Profile updated."; feedback.classList.remove("hidden"); }
        });
    }
    document.querySelectorAll("[data-print-page]").forEach(function(button) {
        button.addEventListener("click", function() { window.print(); });
    });
});
