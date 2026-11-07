/* UNIT V: DESTINATION CATALOG AND WISHLIST */
document.addEventListener("DOMContentLoaded", function() {
    const user = AppStorage.getActiveUser();
    const page = document.body.dataset.page;
    const catalog = [
        {name:"Goa",region:"West India",daily:3500,season:"November–February",description:"Beaches, heritage and coastal food."},
        {name:"Manali",region:"North India",daily:3000,season:"March–June",description:"Mountain scenery and outdoor activities."},
        {name:"Shimla",region:"North India",daily:2800,season:"March–June",description:"Colonial architecture and Himalayan views."},
        {name:"Jaipur",region:"North India",daily:2600,season:"October–March",description:"Forts, palaces and colourful markets."},
        {name:"Udaipur",region:"West India",daily:3200,season:"October–March",description:"Lakes, palaces and old-city walks."},
        {name:"Rishikesh",region:"North India",daily:2400,season:"September–April",description:"Riverfront, yoga and adventure."},
        {name:"Varanasi",region:"North India",daily:2200,season:"October–March",description:"Historic ghats and cultural heritage."},
        {name:"Munnar",region:"South India",daily:3000,season:"September–March",description:"Tea gardens and misty hills."},
        {name:"Ooty",region:"South India",daily:2800,season:"October–June",description:"Hill-station scenery and gardens."},
        {name:"Darjeeling",region:"East India",daily:3200,season:"March–May",description:"Tea estates and mountain panoramas."},
        {name:"Andaman",region:"South India",daily:5000,season:"October–May",description:"Islands, beaches and marine life."}
    ];
    const grid = document.getElementById("destinationsGrid");
    const search = document.getElementById("searchDestInput");
    const region = document.getElementById("filterDestRegion");
    function renderCatalog() {
        if (!grid) return;
        const q = (search?.value || "").toLowerCase();
        const selectedRegion = region?.value || "all";
        const filtered = catalog.filter(function(d) {
            const regionMatch = selectedRegion === "all" || d.region === selectedRegion;
            return regionMatch && (d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
        });
        grid.innerHTML = filtered.map(function(d) {
            return `<article class="card"><span class="badge badge-info">${d.region}</span><h3>${d.name}</h3><p>${d.description}</p><p><strong>Illustrative daily estimate: ₹${d.daily.toLocaleString("en-IN")}</strong></p><p class="text-muted">Best time: ${d.season}</p><button type="button" class="btn btn-outline btn-sm add-destination-wish" data-name="${d.name}" data-budget="${d.daily}">Save to Wishlist</button></article>`;
        }).join("") || "<p>No destinations match your search.</p>";
    }
    if (search) search.addEventListener("input", renderCatalog);
    if (region) region.addEventListener("change", renderCatalog);
    if (grid) {
        renderCatalog();
        grid.addEventListener("click", function(event) {
            const button = event.target.closest(".add-destination-wish");
            if (!button || !user) return;
            const items = AppStorage.getUserRecords("tbt_wishlist", user.id);
            if (items.some(function(item) { return item.name === button.dataset.name; })) return alert("Already saved.");
            items.push({id:"wish_"+Date.now(),userId:user.id,name:button.dataset.name,season:"Flexible",budget:Number(button.dataset.budget),priority:"Medium"});
            AppStorage.saveRecords("tbt_wishlist", AppStorage.readRecords("tbt_wishlist").concat(items.filter(function(x){return !AppStorage.readRecords("tbt_wishlist").some(function(y){return y.id===x.id;});})));
            alert("Destination saved to your wishlist.");
        });
    }
    const wishForm = document.getElementById("wishlistForm");
    const wishGrid = document.getElementById("wishlistGrid");
    if (wishForm && user) {
        function renderWishlist() {
            const items = AppStorage.getUserRecords("tbt_wishlist", user.id);
            if (wishGrid) wishGrid.innerHTML = items.map(function(item) {
                return `<article class="card"><h3>${item.name}</h3><p>${item.season} · ${item.priority} priority</p><p>Estimated budget: ${item.budget}</p><button type="button" class="btn btn-danger btn-sm remove-wish" data-id="${item.id}">Remove</button></article>`;
            }).join("") || "<p>Your wishlist is empty.</p>";
        }
        wishForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const item = {id:"wish_"+Date.now(),userId:user.id,name:document.getElementById("wishName").value.trim(),season:document.getElementById("wishSeason").value.trim(),budget:Number(document.getElementById("wishBudget").value),priority:document.getElementById("wishPriority").value};
            if (!item.name || !Number.isFinite(item.budget) || item.budget < 0) return alert("Enter a valid destination and budget.");
            const all = AppStorage.readRecords("tbt_wishlist");
            if (all.some(function(x){return x.userId===user.id && x.name.toLowerCase()===item.name.toLowerCase();})) return alert("Destination is already saved.");
            all.push(item); AppStorage.saveRecords("tbt_wishlist", all); wishForm.reset(); renderWishlist();
        });
        wishGrid?.addEventListener("click", function(event) {
            const button = event.target.closest(".remove-wish");
            if (!button) return;
            AppStorage.saveRecords("tbt_wishlist", AppStorage.readRecords("tbt_wishlist").filter(function(item){return item.id!==button.dataset.id || item.userId!==user.id;}));
            renderWishlist();
        });
        renderWishlist();
    }
    const calculator = document.getElementById("destCostCalculatorForm");
    calculator?.addEventListener("submit", function(event) {
        event.preventDefault();
        const daily=Number(document.getElementById("calcSelectDest").value), days=Number(document.getElementById("calcDays").value), people=Number(document.getElementById("calcPeople").value);
        const output=document.getElementById("destCalcResultText");
        if (![daily,days,people].every(Number.isFinite) || daily<0 || days<1 || people<1) return alert("Enter valid cost, days and travelers.");
        output.textContent="Illustrative estimate: ₹"+(daily*days*people).toLocaleString("en-IN");
    });
});
