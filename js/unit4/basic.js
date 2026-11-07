/* UNIT IV: PURE BEGINNER-LEVEL JAVASCRIPT HELPERS (NO DOM, STORAGE OR LOOPS) */
function isStringValid(text, minLength) {
    if (typeof text !== "string") return false;
    return text.trim().length >= minLength;
}
function doPasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}
function isEmailFormatValid(email) {
    if (typeof email !== "string") return false;
    const value = email.trim();
    const atPosition = value.indexOf("@");
    const dotPosition = value.lastIndexOf(".");
    return atPosition > 0 && dotPosition > atPosition + 1 && dotPosition < value.length - 1 && !value.includes(" ");
}
function createNewUserObject(id, name, email, password, homeCurrency, budgetStyle) {
    return {
        id: id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordDemo: password,
        homeCurrency: homeCurrency,
        budgetStyle: budgetStyle,
        role: "user",
        status: "active",
        preferences: { theme: "light", contingencyPercent: 10 }
    };
}
function calculateRemainingBudget(totalBudget, totalSpent) {
    const budget = Number(totalBudget);
    const spent = Number(totalSpent);
    if (!Number.isFinite(budget) || !Number.isFinite(spent)) return 0;
    return budget - spent;
}
function calculatePercentageUsed(totalBudget, totalSpent) {
    const budget = Number(totalBudget);
    const spent = Number(totalSpent);
    if (!Number.isFinite(budget) || !Number.isFinite(spent) || budget <= 0) return 0;
    return (spent / budget) * 100;
}

function escapeHTML(value) {
    return String(value === undefined || value === null ? "" : value)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
