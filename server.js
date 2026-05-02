const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// 🔑 SUPABASE CONFIG
const supabase = createClient(
  "https://mzconpuykzsysdbykdlr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Y29ucHV5a3pzeXNkYnlrZGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODIzNzYsImV4cCI6MjA5MzI1ODM3Nn0.bTBcUf7cQS6FGQN_hpTWYlEweWhtkW4rSyItbQtx234"
);

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .insert([{ email: username, password: hashed, balance: 0 }]);

    if (error) return res.status(400).send(error.message);

    res.send("Registered");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", username)
      .single();

    if (error || !data) return res.status(401).send("Invalid user");

    const match = await bcrypt.compare(password, data.password);

    if (!match) return res.status(401).send("Wrong password");

    res.json(data);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// INVEST
app.post("/invest", async (req, res) => {
  try {
    const { username, amount } = req.body;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("email", username)
      .single();

    let newBalance = data.balance + amount * 0.2;

    await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("email", username);

    res.send("Investment successful");
  } catch (err) {
    res.status(500).send("Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Server running"));
