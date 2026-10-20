const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("internships.db");

app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    stipend REAL DEFAULT 0,
    status TEXT DEFAULT 'Applied'
  )
`);

app.get("/", (req, res) => {
  res.send("Internship Records API is running!");
});

// Get all internships
app.get("/internships", (req, res) => {
  const records = db.prepare("SELECT * FROM internships").all();
  res.json(records);
});

// Get one internship
app.get("/internships/:id", (req, res) => {
  const record = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(req.params.id);

  if (!record) {
    return res.status(404).json({ error: "Internship not found" });
  }

  res.json(record);
});

// Add internship
app.post("/internships", (req, res) => {
  const { company, role, stipend = 0, status = "Applied" } = req.body;

  if (
    typeof company !== "string" || !company.trim() ||
    typeof role !== "string" || !role.trim() ||
    !Number.isFinite(stipend) || stipend < 0 ||
    typeof status !== "string" || !status.trim()
  ) {
    return res.status(400).json({ error: "Invalid internship data" });
  }

  const result = db.prepare(`
    INSERT INTO internships (company, role, stipend, status)
    VALUES (?, ?, ?, ?)
  `).run(company.trim(), role.trim(), stipend, status.trim());

  res.status(201).json({
    message: "Internship added successfully",
    id: result.lastInsertRowid
  });
});

// Update internship
app.put("/internships/:id", (req, res) => {
  const { company, role, stipend, status } = req.body;

  if (
    typeof company !== "string" || !company.trim() ||
    typeof role !== "string" || !role.trim() ||
    !Number.isFinite(stipend) || stipend < 0 ||
    typeof status !== "string" || !status.trim()
  ) {
    return res.status(400).json({ error: "Invalid internship data" });
  }

  const result = db.prepare(`
    UPDATE internships
    SET company = ?, role = ?, stipend = ?, status = ?
    WHERE id = ?
  `).run(company.trim(), role.trim(), stipend, status.trim(), req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Internship not found" });
  }

  res.json({ message: "Internship updated successfully" });
});

// Delete internship
app.delete("/internships/:id", (req, res) => {
  const result = db.prepare(
    "DELETE FROM internships WHERE id = ?"
  ).run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Internship not found" });
  }

  res.json({ message: "Internship deleted successfully" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});