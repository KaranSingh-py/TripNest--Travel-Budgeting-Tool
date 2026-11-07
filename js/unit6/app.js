/* UNIT VI: PAGE-LEVEL APPLICATION INTEGRATION */
document.addEventListener("DOMContentLoaded", function() {
    /* Mobile sidebar navigation */
    const sidebar = document.getElementById("appSidebar");
    const openSidebarBtn = document.getElementById("openSidebarBtn");
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");

    if (sidebar && openSidebarBtn) {
        let sidebarOverlay = document.getElementById("sidebarOverlay");

        if (!sidebarOverlay) {
            sidebarOverlay = document.createElement("button");
            sidebarOverlay.type = "button";
            sidebarOverlay.id = "sidebarOverlay";
            sidebarOverlay.className = "sidebar-overlay";
            sidebarOverlay.setAttribute("aria-label", "Close navigation menu");
            sidebarOverlay.setAttribute("tabindex", "-1");
            document.body.appendChild(sidebarOverlay);
        }

        function openMobileSidebar() {
            sidebar.classList.add("sidebar-open");
            sidebarOverlay.classList.add("sidebar-overlay-visible");
            openSidebarBtn.setAttribute("aria-expanded", "true");
            sidebar.setAttribute("aria-hidden", "false");
            document.body.classList.add("sidebar-menu-open");
        }

        function closeMobileSidebar() {
            sidebar.classList.remove("sidebar-open");
            sidebarOverlay.classList.remove("sidebar-overlay-visible");
            openSidebarBtn.setAttribute("aria-expanded", "false");
            sidebar.setAttribute("aria-hidden", "true");
            document.body.classList.remove("sidebar-menu-open");
        }

        openSidebarBtn.setAttribute("aria-controls", "appSidebar");
        openSidebarBtn.setAttribute("aria-expanded", "false");
        sidebar.setAttribute("aria-hidden", window.matchMedia("(max-width: 768px)").matches ? "true" : "false");

        openSidebarBtn.addEventListener("click", openMobileSidebar);
        if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeMobileSidebar);
        sidebarOverlay.addEventListener("click", closeMobileSidebar);

        sidebar.querySelectorAll("a").forEach(function(link) {
            link.addEventListener("click", closeMobileSidebar);
        });

        document.addEventListener("keydown", function(event) {
            if (event.key === "Escape") closeMobileSidebar();
        });

        window.addEventListener("resize", function() {
            if (!window.matchMedia("(max-width: 768px)").matches) {
                closeMobileSidebar();
                sidebar.setAttribute("aria-hidden", "false");
            } else if (!sidebar.classList.contains("sidebar-open")) {
                sidebar.setAttribute("aria-hidden", "true");
            }
        });
    }

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
