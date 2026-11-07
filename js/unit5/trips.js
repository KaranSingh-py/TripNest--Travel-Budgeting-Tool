/* UNIT V: TRIPS */
document.addEventListener("DOMContentLoaded", function() {
    const activeUser = AppStorage.getActiveUser();
    const tripForm = document.getElementById("tripForm");
    const grid = document.getElementById("tripsGridContainer");

    function renderTrips() {
        if (!grid || !activeUser) return;
        const trips = AppStorage.getUserRecords("tbt_trips", activeUser.id);
        grid.innerHTML = "";
        if (trips.length === 0) {
            grid.innerHTML = `<p class="text-muted">No trips found.</p>`;
            return;
        }
        trips.forEach(trip => {
            let badgeClass = "badge-info";
            if (trip.status === "archived") badgeClass = "badge-danger";
            grid.innerHTML += `
                <article class="card trip-card" data-budget="${Number(trip.totalBudget)||0}" data-start="${escapeHTML(trip.startDate)}">
                    <div class="trip-card-header"><span class="badge ${badgeClass}">${trip.status.toUpperCase()}</span><span class="trip-currency-tag">${trip.currency}</span></div>
                    <h3>${escapeHTML(trip.tripName)}</h3>
                    <p class="trip-destination">${escapeHTML(trip.destination)}</p>
                    <p class="trip-dates">${trip.startDate} to ${trip.endDate}</p>
                    <div class="trip-budget-summary"><strong>Budget: $${Number(trip.totalBudget).toFixed(2)}</strong></div>
                    <div class="card-actions">
                        <a href="./trip-details.html?id=${trip.id}" class="btn btn-primary btn-sm">Open Workspace</a>
                        <button class="btn btn-outline btn-sm action-edit" data-id="${trip.id}">Edit</button>
                        <button class="btn btn-outline btn-sm action-duplicate" data-id="${trip.id}">Duplicate</button>
                        <button class="btn btn-outline btn-sm action-archive" data-id="${trip.id}">Archive</button>
                        <button class="btn btn-danger btn-sm action-delete" data-id="${trip.id}">Del</button>
                    </div>
                </article>
            `;
        });
    }

    if (tripForm) {
        tripForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const idInput = document.getElementById("tripIdInput").value;
            const tripId = idInput ? idInput : "trip_" + Date.now();
            const tripRecord = {
                id: tripId, userId: activeUser.id,
                tripName: document.getElementById("tripTitle").value, destination: document.getElementById("tripDestination").value,
                startDate: document.getElementById("tripStartDate").value, endDate: document.getElementById("tripEndDate").value,
                status: document.getElementById("tripStatus").value, totalBudget: Number(document.getElementById("tripTotalBudget").value),
                currency: document.getElementById("tripCurrency").value, travelers: document.getElementById("tripTravelersCount").value,
                budgetStyle: document.getElementById("tripBudgetTemplate").value, description: document.getElementById("tripNotes").value
            };
            if (!tripRecord.tripName || !tripRecord.destination || !tripRecord.startDate || !tripRecord.endDate ||
                tripRecord.endDate < tripRecord.startDate || !Number.isFinite(tripRecord.totalBudget) || tripRecord.totalBudget <= 0) {
                alert("Please enter valid trip details, dates and a positive budget."); return;
            }
            tripRecord.travelers = Math.max(1, Number(tripRecord.travelers) || 1);
            AppStorage.saveUserRecord("tbt_trips", tripRecord);
            tripForm.reset(); document.getElementById("tripIdInput").value = "";
            renderTrips();
        });
    }

    if (grid) {
        grid.addEventListener("click", function(e) {
            const id = e.target.getAttribute("data-id");
            if (!id) return;
            if (e.target.classList.contains("action-duplicate")) {
                const original = AppStorage.getUserRecords("tbt_trips", activeUser.id).find(t => t.id === id);
                if (original) { const copy = Object.assign({}, original, {id:"trip_"+Date.now(), tripName:original.tripName+" (Copy)", status:"planning", creationDate:new Date().toISOString()}); AppStorage.saveUserRecord("tbt_trips", copy); renderTrips(); }
            } else if (e.target.classList.contains("action-archive")) {
                const all = AppStorage.readRecords("tbt_trips"); const trip = all.find(t => t.id === id && t.userId === activeUser.id);
                if (trip) { trip.status = "archived"; AppStorage.saveRecords("tbt_trips", all); renderTrips(); }
            } else if (e.target.classList.contains("action-delete")) {
                if (confirm("Delete this trip?")) {
                    AppStorage.saveRecords("tbt_trips", AppStorage.readRecords("tbt_trips").filter(t => t.id !== id || t.userId !== activeUser.id));
                    AppStorage.saveRecords("tbt_expenses", AppStorage.readRecords("tbt_expenses").filter(x => x.tripId !== id || x.userId !== activeUser.id));
                    ["tbt_allocations","tbt_itineraries","tbt_checklists","tbt_packing","tbt_reminders","tbt_savings"].forEach(function(key) {
                        AppStorage.saveRecords(key, AppStorage.readRecords(key).filter(function(item) { return item.tripId !== id; }));
                    });
                    localStorage.removeItem("tbt_travelers_" + id);
                    renderTrips();
                }
            } else if (e.target.classList.contains("action-edit")) {
                const trip = AppStorage.getUserRecords("tbt_trips", activeUser.id).find(t => t.id === id);
                if (trip) {
                    document.getElementById("tripIdInput").value = trip.id;
                    document.getElementById("tripTitle").value = trip.tripName;
                    document.getElementById("tripDestination").value = trip.destination;
                    document.getElementById("tripStartDate").value = trip.startDate;
                    document.getElementById("tripEndDate").value = trip.endDate;
                    document.getElementById("tripStatus").value = trip.status;
                    document.getElementById("tripTotalBudget").value = trip.totalBudget;
                    document.getElementById("tripCurrency").value = trip.currency;
                    document.getElementById("tripTravelersCount").value = trip.travelers;
                    document.getElementById("tripNotes").value = trip.description;
                    window.scrollTo(0, document.getElementById("tripForm").offsetTop - 100);
                }
            }
        });
    }
    renderTrips();
});
