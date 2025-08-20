import express from "express";
import protect from "../middleware/auth.middleware.js";
import Article from "../models/Article.js";


const router = express.Router();

// get single article
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().populate("author", "email");
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
// add article
router.post("/", protect, async (req, res) => {
  const { title, content } = req.body;

  try {
    const article = await Article.create({
      title,
      content,
      author: req.user._id,
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// edit article
router.patch("/:id", protect, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!article) return res.status(404).json({ message: "Not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// delete article
router.delete("/:id", protect, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Article removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
