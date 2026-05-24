module.exports = function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ status: "ok", endpoint: "/api/claude", method: "POST" });
};
