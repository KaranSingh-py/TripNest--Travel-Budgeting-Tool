/* UNIT V: STORAGE, JSON AND SESSION MANAGEMENT */
const AppStorage = {
    readRecords: function(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) throw new Error("Stored value is not an array: " + key);
            return parsed;
        } catch (error) {
            console.error("TripNest storage read failed:", key, error);
            try { localStorage.setItem("tripnest-storage-warning", JSON.stringify({key:key, at:new Date().toISOString()})); } catch (_) {}
            return [];
        }
    },
    saveRecords: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error("TripNest storage write failed:", key, error);
            if (typeof showAppError === "function") showAppError("Your browser could not save this change. Storage may be full.");
            return false;
        }
    },
    getUserRecords: function(key, userId) {
        return this.readRecords(key).filter(function(record) { return record && record.userId === userId; });
    },
    saveUserRecord: function(key, record) {
        if (!record || !record.id || !record.userId) return false;
        const records = this.readRecords(key);
        const index = records.findIndex(function(item) { return item.id === record.id; });
        if (index >= 0) records[index] = record; else records.push(record);
        return this.saveRecords(key, records);
    },
    deleteRecord: function(key, id) {
        return this.saveRecords(key, this.readRecords(key).filter(function(record) { return record.id !== id; }));
    },
    getActiveUser: function() {
        try {
            const raw = sessionStorage.getItem("tbt_active_user");
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error("Invalid session data; clearing session.", error);
            this.clearSession();
            return null;
        }
    },
    setActiveUser: function(user) {
        try {
            sessionStorage.setItem("tbt_active_user", JSON.stringify(user));
            return true;
        } catch (error) {
            console.error("Could not save session:", error);
            return false;
        }
    },
    clearSession: function() {
        try { sessionStorage.removeItem("tbt_active_user"); } catch (error) { console.error(error); }
    },
    initializeDefaultData: function() {
        let users = this.readRecords("tbt_users");
        let admin = users.find(function(user) { return user.email === "admin@tripnest.com"; });
        if (!admin) {
            admin = createNewUserObject("usr_admin999", "TripNest Administrator", "admin@tripnest.com", "Admin@123", "INR", "moderate");
            admin.role = "admin";
            users.push(admin);
        } else {
            admin.role = "admin";
            admin.passwordDemo = "Admin@123";
            if (!admin.id) admin.id = "usr_admin999";
        }
        if (!users.some(function(user) { return user.email === "demo@student.edu"; })) {
            const demo = createNewUserObject("usr_demo123", "Demo Traveler", "demo@student.edu", "travel123", "INR", "moderate");
            demo.role = "user";
            users.push(demo);
        }
        this.saveRecords("tbt_users", users);
        if (this.readRecords("tbt_trips").length === 0) {
            this.saveRecords("tbt_trips", [
                {id:"trip_101",userId:"usr_demo123",tripName:"Goa Weekend Getaway",destination:"Goa, India",startDate:"2026-12-10",endDate:"2026-12-15",travelers:2,totalBudget:1500,currency:"INR",budgetStyle:"moderate",description:"Relaxing beach trip.",status:"upcoming",creationDate:new Date().toISOString()},
                {id:"trip_102",userId:"usr_demo123",tripName:"Kyoto Sakura Tour",destination:"Kyoto, Japan",startDate:"2027-04-05",endDate:"2027-04-12",travelers:1,totalBudget:2500,currency:"INR",budgetStyle:"moderate",description:"Spring blossoms.",status:"planning",creationDate:new Date().toISOString()}
            ]);
        }
        if (this.readRecords("tbt_expenses").length === 0) {
            this.saveRecords("tbt_expenses", [
                {id:"exp_201",tripId:"trip_101",userId:"usr_demo123",title:"Roundtrip Flights",category:"Flights",date:"2026-11-01",amount:400,currency:"INR",paymentMethod:"Card",paidBy:"Demo Traveler",splitType:"equal"},
                {id:"exp_202",tripId:"trip_101",userId:"usr_demo123",title:"Resort Booking Advance",category:"Accommodation",date:"2026-11-05",amount:300,currency:"INR",paymentMethod:"Card",paidBy:"Demo Traveler",splitType:"equal"}
            ]);
        }
        if (!localStorage.getItem("tbt_master_categories")) {
            this.saveRecords("tbt_master_categories", ["Flights","Accommodation","Food","Local transportation","Activities and sightseeing","Shopping","Miscellaneous"]);
        }
    }
};
AppStorage.initializeDefaultData();
