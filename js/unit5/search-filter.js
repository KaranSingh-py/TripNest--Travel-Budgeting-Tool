/* UNIT V: LIVE TRIP SEARCH, STATUS FILTER AND SORT
   Filtering is called explicitly after trip cards are rendered. Avoid observing
   the grid with MutationObserver: moving cards during sorting would trigger
   another mutation and could create an endless render loop. */
document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("tripsGridContainer");
    const search = document.getElementById("searchTripInput");
    const status = document.getElementById("filterTripStatus");
    const sort = document.getElementById("sortTripsBy");
    if (!grid) return;

    window.applyTripFilters = function() {
        const q = (search && search.value ? search.value : "").trim().toLowerCase();
        const selectedStatus = status ? status.value : "all";
        const cards = Array.from(grid.querySelectorAll(".trip-card"));

        cards.forEach(function(card) {
            const text = (card.textContent || "").toLowerCase();
            const badge = card.querySelector(".badge");
            const cardStatus = badge ? badge.textContent.trim().toLowerCase() : "";
            const statusMatches = selectedStatus === "all" ||
                cardStatus === selectedStatus ||
                (selectedStatus === "completed" && cardStatus === "completed");
            card.hidden = !(text.includes(q) && statusMatches);
        });

        const visible = cards.filter(function(card) { return !card.hidden; });
        visible.sort(function(a, b) {
            if (sort && sort.value === "budgetDesc") {
                return (Number(b.dataset.budget) || 0) - (Number(a.dataset.budget) || 0);
            }
            return (a.dataset.start || "").localeCompare(b.dataset.start || "");
        });

        // Reorder only when the order actually differs; no observer is needed.
        const currentOrder = Array.from(grid.querySelectorAll(".trip-card"));
        const desiredOrder = visible.concat(cards.filter(function(card) { return card.hidden; }));
        if (currentOrder.some(function(card, index) { return card !== desiredOrder[index]; })) {
            desiredOrder.forEach(function(card) { grid.appendChild(card); });
        }

        const count = document.getElementById("tripCountBadge");
        if (count) count.textContent = visible.length + " trips";
    };

    if (search) search.addEventListener("input", window.applyTripFilters);
    if (status) status.addEventListener("change", window.applyTripFilters);
    if (sort) sort.addEventListener("change", window.applyTripFilters);
    window.applyTripFilters();
});
