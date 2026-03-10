const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const { protect } = require("../middleware/auth");

const NEWS_KEY = process.env.NEWS_API_KEY || "";

// GET /api/news?category=business
router.get("/", protect, async (req, res) => {
  try {
    const { category = "business" } = req.query;
    if (!NEWS_KEY) {
      return res.json({ success: true, articles: getMockNews() });
    }
    const { data } = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_KEY}`,
      { timeout: 6000 }
    );
    res.json({ success: true, articles: data.articles || [] });
  } catch {
    res.json({ success: true, articles: getMockNews() });
  }
});

function getMockNews() {
  return [
    { title:"Fed holds rates steady amid inflation concerns", description:"The Federal Reserve kept interest rates unchanged...", url:"#", urlToImage:"", source:{name:"Reuters"}, publishedAt: new Date().toISOString() },
    { title:"NVIDIA hits new all-time high on AI demand", description:"NVIDIA shares surged past $900 on record GPU demand...", url:"#", urlToImage:"", source:{name:"Bloomberg"}, publishedAt: new Date().toISOString() },
    { title:"Apple reports strong Q1 earnings", description:"Apple Inc. beat Wall Street expectations with record services revenue...", url:"#", urlToImage:"", source:{name:"CNBC"}, publishedAt: new Date().toISOString() },
  ];
}

module.exports = router;