const fs = require('fs-extra');
const path = require('path');

const dbPath = path.join(__dirname, '../database.json');

// Initialiser la base de données
function initDB() {
    if (!fs.existsSync(dbPath)) {
        fs.writeJsonSync(dbPath, {
            users: {},
            groups: {},
            economy: {},
            banned: []
        });
    }
    return fs.readJsonSync(dbPath);
}

// Sauvegarder la base de données
function saveDB(data) {
    fs.writeJsonSync(dbPath, data, { spaces: 2 });
}

// Récupérer un utilisateur
async function getUser(userId) {
    const db = initDB();
    return db.users[userId];
}

// Créer un utilisateur
async function createUser(userId) {
    const db = initDB();
    db.users[userId] = {
        userId: userId,
        money: 100,
        level: 1,
        xp: 0,
        nextLevelXP: 100,
        gamesPlayed: 0,
        wins: 0,
        daily: null,
        registeredAt: new Date().toISOString()
    };
    saveDB(db);
    return db.users[userId];
}

// Ajouter de l'argent
async function addMoney(userId, amount) {
    const db = initDB();
    if (!db.users[userId]) await createUser(userId);
    db.users[userId].money += amount;
    saveDB(db);
    return db.users[userId].money;
}

// Réclamer le daily
async function claimDaily(userId) {
    const db = initDB();
    if (!db.users[userId]) await createUser(userId);
    
    const lastDaily = db.users[userId].daily;
    const now = new Date();
    
    if (lastDaily) {
        const lastDate = new Date(lastDaily);
        const hoursDiff = (now - lastDate) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            const nextClaim = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
            return {
                success: false,
                nextClaim: nextClaim.toLocaleString()
            };
        }
    }
    
    const amount = Math.floor(Math.random() * 200) + 100; // 100-300
    db.users[userId].money += amount;
    db.users[userId].daily = now.toISOString();
    saveDB(db);
    
    return {
        success: true,
        amount: amount
    };
}

// Ajouter de l'XP
async function addXP(userId, xp) {
    const db = initDB();
    if (!db.users[userId]) await createUser(userId);
    
    db.users[userId].xp += xp;
    
    // Vérifier le level up
    while (db.users[userId].xp >= db.users[userId].nextLevelXP) {
        db.users[userId].level++;
        db.users[userId].xp -= db.users[userId].nextLevelXP;
        db.users[userId].nextLevelXP = Math.floor(db.users[userId].nextLevelXP * 1.5);
    }
    
    saveDB(db);
    return db.users[userId];
}

module.exports = {
    getUser,
    createUser,
    addMoney,
    claimDaily,
    addXP
};
