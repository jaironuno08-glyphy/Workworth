const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let tokens = [];

app.get("/", (req, res) => {
  res.send("Crypto Forge API running");
});

app.get("/api/tokens", (req, res) => {
  res.json(tokens);
});

app.post("/api/tokens", (req, res) => {

  const { name, symbol, supply, network } = req.body;

  if (!name || !symbol) {
    return res.status(400).json({
      error: "Name and symbol required"
    });
  }

  const token = {
    id: Date.now(),
    name,
    symbol,
    supply: supply || "1000000000",
    network: network || "Ethereum",
    created: new Date()
  };

  tokens.push(token);

  res.status(201).json(token);

});

app.delete("/api/tokens/:id", (req, res) => {

  const id = Number(req.params.id);

  tokens = tokens.filter(t => t.id !== id);

  res.json({ success: true });

});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Crypto Forge running on port ${PORT}`);
});
