const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

let users = [];

// REGISTER
app.post("/register", (req, res) => {
  const { username, password, ref } = req.body;

  const user = {
    username,
    password,
    balance: 0,
    ref,
    referrals: []
  };

  users.push(user);

  // referral reward
  if (ref) {
    let refUser = users.find(u => u.username === ref);
    if (refUser) {
      refUser.balance += 2;
      refUser.referrals.push(username);
    }
  }

  res.send("Registered");
});

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (user) res.json(user);
  else res.status(401).send("Invalid");
});

// INVEST
app.post("/invest", (req, res) => {
  const { username, amount } = req.body;

  let user = users.find(u => u.username === username);
  user.balance += amount * 0.2;

  res.json(user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
