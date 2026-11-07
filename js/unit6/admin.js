/* UNIT VI: ACADEMIC DEMONSTRATION ADMIN PANEL */
document.addEventListener("DOMContentLoaded", function() {
    if (document.body.dataset.page !== "admin") return;
    const currentAdmin = AppStorage.getActiveUser();
    const storedAdmin = currentAdmin && AppStorage.readRecords("tbt_users").find(function(u) { return u.id === currentAdmin.id && u.role === "admin"; });
    if (!storedAdmin) { window.location.replace("./login.html"); return; }
    const defaultCategories = ["Flights", "Accommodation", "Food", "Local transportation", "Activities and sightseeing", "Shopping", "Miscellaneous"];

    function initMasterData() {
        if (!localStorage.getItem("tbt_master_categories")) AppStorage.saveRecords("tbt_master_categories", defaultCategories);
    }
    initMasterData();

    function updateStats() {
        const users = AppStorage.readRecords("tbt_users");
        const trips = AppStorage.readRecords("tbt_trips");
        const exps = AppStorage.readRecords("tbt_expenses");
        
        if (document.getElementById("adminUsersCount")) document.getElementById("adminUsersCount").textContent = users.length;
        if (document.getElementById("adminTripsCount")) document.getElementById("adminTripsCount").textContent = trips.length;
        if (document.getElementById("adminExpensesCount")) document.getElementById("adminExpensesCount").textContent = exps.length;

        const userTbody = document.getElementById("adminUserTbody");
        if (userTbody) {
            userTbody.innerHTML = "";
            if (users.length === 0) {
                userTbody.innerHTML = `<tr><td colspan="4" class="text-muted text-center">No users found.</td></tr>`;
            } else {
                users.forEach(u => {
                    const userTrips = trips.filter(t => t.userId === u.id).length;
                    userTbody.innerHTML += `<tr><td><strong>${u.name}</strong></td><td>${u.email}</td><td>${userTrips}</td><td>${u.role === "admin" ? '<span class="badge badge-info">Administrator</span>' : `<button type="button" class="btn btn-danger btn-xs action-remove-user" data-id="${u.id}">Remove</button>`}</td></tr>`;
                });
            }
        }

        const popTbody = document.getElementById("adminPopularDestTbody");
        if (popTbody) {
            popTbody.innerHTML = "";
            let destCounts = {};
            trips.forEach(t => { destCounts[t.destination] = (destCounts[t.destination] || 0) + 1; });
            const sortedDests = Object.keys(destCounts).map(d => { return { name: d, count: destCounts[d] }; }).sort((a, b) => b.count - a.count).slice(0, 5);
            if (sortedDests.length === 0) {
                popTbody.innerHTML = `<tr><td colspan="2" class="text-muted text-center">No trips created yet.</td></tr>`;
            } else {
                sortedDests.forEach(d => { popTbody.innerHTML += `<tr><td><strong>${d.name}</strong></td><td><span class="badge badge-info">${d.count} Trips</span></td></tr>`; });
            }
        }
    }

    function renderCategories() {
        const catContainer = document.getElementById("adminCategoryTags");
        if (!catContainer) return;
        const cats = AppStorage.readRecords("tbt_master_categories");
        catContainer.innerHTML = "";
        cats.forEach(c => {
            catContainer.innerHTML += `<div style="background:var(--bg-alt); padding:5px 12px; border-radius:16px; border:1px solid var(--border-color); display:flex; align-items:center; gap:8px;"><span style="font-size:0.85rem;">${c}</span><button type="button" class="btn-xs action-remove-cat" data-name="${c}" style="background:none; border:none; color:var(--error); cursor:pointer; font-weight:bold;">&times;</button></div>`;
        });
    }

    const catForm = document.getElementById("adminAddCategoryForm");
    if (catForm) {
        catForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const newCat = document.getElementById("newCategoryName").value.trim();
            if (newCat) {
                const cats = AppStorage.readRecords("tbt_master_categories");
                if (!cats.includes(newCat)) { cats.push(newCat); AppStorage.saveRecords("tbt_master_categories", cats); renderCategories(); catForm.reset(); } 
                else { alert("Category already exists."); }
            }
        });
    }

    document.body.addEventListener("click", function(e) {
        if (e.target.classList.contains("action-remove-user")) {
            const id = e.target.getAttribute("data-id");
            const target = AppStorage.readRecords("tbt_users").find(function(u) { return u.id === id; });
            if (!target || target.role === "admin" || target.id === currentAdmin.id) return alert("The administrator account cannot be removed here.");
            if (confirm("Are you sure? This removes the user and associated demo data.")) {
                AppStorage.saveRecords("tbt_users", AppStorage.readRecords("tbt_users").filter(u => u.id !== id));
                AppStorage.saveRecords("tbt_trips", AppStorage.readRecords("tbt_trips").filter(t => t.userId !== id));
                AppStorage.saveRecords("tbt_expenses", AppStorage.readRecords("tbt_expenses").filter(ex => ex.userId !== id));
                updateStats();
            }
        }
        if (e.target.classList.contains("action-remove-cat")) {
            const name = e.target.getAttribute("data-name");
            if (defaultCategories.includes(name)) return alert("Cannot delete system categories.");
            if (confirm(`Delete category "${name}"?`)) {
                AppStorage.saveRecords("tbt_master_categories", AppStorage.readRecords("tbt_master_categories").filter(c => c !== name));
                renderCategories();
            }
        }
    });

    const inspectorSelect = document.getElementById("inspectorKeySelect");
    const jsonPre = document.getElementById("jsonInspectorPre");
    function renderJSON() {
        const key = inspectorSelect.value;
        const data = localStorage.getItem(key);
        if (!jsonPre || !inspectorSelect) return;
        try { if (data) { jsonPre.textContent = JSON.stringify(JSON.parse(data), null, 2); }
        else { jsonPre.textContent = "[] // No data exists for this key."; } }
        catch (error) { jsonPre.textContent = "Stored JSON is corrupted: " + error.message; }
    }
    if (inspectorSelect) { inspectorSelect.addEventListener("change", renderJSON); renderJSON(); }

    document.getElementById("clearAllStorageBtn")?.addEventListener("click", function() {
        if (confirm("WARNING: Wipe ALL data?")) { localStorage.clear(); sessionStorage.clear(); window.location.href = "./login.html"; }
    });
    document.getElementById("resetSeedDataBtn")?.addEventListener("click", function() {
        if (confirm("Restore seed data?")) { localStorage.clear(); AppStorage.initializeDefaultData(); window.location.reload(); }
    });

    updateStats(); renderCategories();
});
