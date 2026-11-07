/* UNIT VI: CENTRAL USER-FACING ERROR HANDLING */
function showAppError(message) {
    let box = document.getElementById("appGlobalMessage");
    if (!box) {
        box = document.createElement("div");
        box.id = "appGlobalMessage";
        box.className = "alert alert-danger";
        box.setAttribute("role", "alert");
        box.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:9999;max-width:360px;";
        document.body.appendChild(box);
    }
    box.textContent = message;
    box.hidden = false;
    window.setTimeout(function() { box.hidden = true; }, 5000);
}
window.addEventListener("error", function(event) {
    console.error("TripNest runtime error:", event.error || event.message);
});
window.addEventListener("unhandledrejection", function(event) {
    console.error("TripNest asynchronous error:", event.reason);
    showAppError("Something went wrong. Please try again.");
});
