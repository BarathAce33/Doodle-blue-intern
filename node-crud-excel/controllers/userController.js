const User = require('../models/User');

// --- CRUD ---

// Create
exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (e) { res.status(400).json({ message: e.message }); }
};

// Read All
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// Update
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(user);
    } catch (e) { res.status(400).json({ message: e.message }); }
};

// Delete
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- CSV Ops ---

// Export CSV (Database -> File)
exports.exportToCsv = async (req, res) => {
    try {
        const users = await User.find().lean();

        // Start with the header row
        let csv = "name,email,age,city\n";

        // Add each user as a new line
        users.forEach(u => {
            csv += `${u.name},${u.email},${u.age},${u.city}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(csv);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// Import CSV (File -> Database)
exports.importFromCsv = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file' });
        const lines = req.file.buffer.toString().split('\n');
        let imported = 0, updated = 0;

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length < 4) continue;

            const userData = {
                name: row[0].trim(),
                email: row[1].trim(),
                age: row[2].trim(),
                city: row[3].trim()
            };

            // Check if user exists to track status
            const exists = await User.findOne({ email: userData.email });
            await User.findOneAndUpdate({ email: userData.email }, userData, { upsert: true });

            if (exists) updated++; else imported++;
        }
        res.json({ message: "Import Successful", imported, updated });
    } catch (e) { res.status(500).json({ message: e.message }); }
};
