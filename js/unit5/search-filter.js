/* UNIT V: LIVE TRIP SEARCH, STATUS FILTER AND SORT */
document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("tripsGridContainer");
    const search = document.getElementById("searchTripInput");
    const status = document.getElementById("filterTripStatus");
    const sort = document.getElementById("sortTripsBy");
    if (!grid) return;
    function applyFilters() {
        const q=(search?.value||"").trim().toLowerCase();
        const s=status?.value||"all";
        const cards=Array.from(grid.querySelectorAll(".trip-card"));
        cards.forEach(function(card) {
            const text=card.textContent.toLowerCase();
            const badge=card.querySelector(".badge");
            const cardStatus=badge ? badge.textContent.toLowerCase() : "";
            card.hidden=!(text.includes(q) && (s==="all" || cardStatus===s));
        });
        if (sort) {
            const visible=cards.filter(function(c){return !c.hidden;});
            visible.sort(function(a,b){
                if (sort.value==="budgetDesc") return (Number(b.dataset.budget)||0)-(Number(a.dataset.budget)||0);
                return (a.dataset.start||"").localeCompare(b.dataset.start||"");
            });
            visible.forEach(function(card){grid.appendChild(card);});
        }
        const count=document.getElementById("tripCountBadge");
        if (count) count.textContent=cards.filter(function(c){return !c.hidden;}).length+" trips";
    }
    search?.addEventListener("input",applyFilters);
    status?.addEventListener("change",applyFilters);
    sort?.addEventListener("change",applyFilters);
    const observer=new MutationObserver(applyFilters);
    observer.observe(grid,{childList:true});
});
