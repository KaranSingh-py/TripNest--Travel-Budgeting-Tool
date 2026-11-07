/* UNIT V: ITINERARY */
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentTripId = urlParams.get('id');
    if (!currentTripId) return;

    const itinForm = document.getElementById("itineraryForm");
    const itinListContainer = document.getElementById("itineraryListContainer");

    function renderItinerary() {
        if (!itinListContainer) return;
        const tripItins = AppStorage.readRecords("tbt_itineraries").filter(i => i.tripId === currentTripId);
        tripItins.sort((a, b) => {
            const dayA = String(a.date || ""); const dayB = String(b.date || "");
            if (dayA !== dayB) return dayA.localeCompare(dayB);
            return a.time.localeCompare(b.time);
        });

        itinListContainer.innerHTML = "";
        let totalEstCost = 0;

        if (tripItins.length === 0) {
            itinListContainer.innerHTML = `<p class="text-muted">No activities planned yet. Add one above.</p>`;
        } else {
            tripItins.forEach(itin => {
                totalEstCost += Number(itin.estimatedCost);
                itinListContainer.innerHTML += `
                    <article class="list-item-card" data-id="${itin.id}">
                        <div>
                            <span class="badge badge-info">Day ${itin.date} | ${itin.time}</span>
                            <h3>${escapeHTML(itin.activity)}</h3>
                            <p class="text-muted">Location: ${escapeHTML(itin.location)} | Category: ${itin.category}</p>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
                            <strong>Est: $${Number(itin.estimatedCost).toFixed(2)}</strong>
                            <div>
                                <button class="btn btn-outline btn-xs convert-to-expense" data-id="${itin.id}">Log Exp</button>
                                <button class="btn btn-danger btn-xs delete-itin" data-id="${itin.id}">Del</button>
                            </div>
                        </div>
                    </article>
                `;
            });
        }
        if (document.getElementById("detailItineraryEstText")) { document.getElementById("detailItineraryEstText").textContent = `Itinerary Est: $${totalEstCost.toFixed(2)}`; }
    }

    if (itinForm) {
        itinForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const date = document.getElementById("itinDay").value; 
            const time = document.getElementById("itinTime").value;
            const activity = document.getElementById("itinTitle").value.trim();
            const location = document.getElementById("itinLocation").value.trim();
            const estimatedCost = parseFloat(document.getElementById("itinCost").value);
            const category = document.getElementById("itinCategory").value;

            if (isNaN(estimatedCost) || estimatedCost < 0) return alert("Cost must be positive.");

            const newItin = { id: "itin_" + Date.now(), tripId: currentTripId, date: date, time: time, activity: activity, location: location, estimatedCost: estimatedCost, category: category };
            let allItins = AppStorage.readRecords("tbt_itineraries");
            allItins.push(newItin); AppStorage.saveRecords("tbt_itineraries", allItins);
            itinForm.reset(); renderItinerary();
        });
    }

    if (itinListContainer) {
        itinListContainer.addEventListener("click", function(e) {
            const itinId = e.target.getAttribute("data-id");
            if (!itinId) return;
            let allItins = AppStorage.readRecords("tbt_itineraries");
            
            if (e.target.classList.contains("delete-itin")) {
                AppStorage.saveRecords("tbt_itineraries", allItins.filter(i => i.id !== itinId));
                renderItinerary();
            } else if (e.target.classList.contains("convert-to-expense")) {
                const itin = allItins.find(i => i.id === itinId);
                if (itin && document.getElementById("expenseForm")) {
                    document.getElementById("expTitle").value = itin.activity + " (Itinerary)";
                    document.getElementById("expCategory").value = itin.category;
                    document.getElementById("expAmount").value = itin.estimatedCost;
                    window.scrollTo(0, document.getElementById("expenseForm").offsetTop - 100);
                }
            }
        });
    }
    renderItinerary();
});
