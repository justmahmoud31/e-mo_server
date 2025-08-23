import express from "express";
import protect from "../middleware/auth.middleware.js";
import Article from "../models/Article.js";
import { upload } from "../config/multer.js";

const router = express.Router();

/**
 * @route GET /articles/:locale/:slug
 * @desc Get single article by locale + slug
 * @access Public
 */
router.get("/:locale/:slug", async (req, res) => {
  const { locale, slug } = req.params;
  if (!["fr", "nl"].includes(locale)) {
    return res.status(400).json({ message: "Invalid locale" });
  }

  try {
    const article = await Article.findOne({ [`translations.${locale}.slug`]: slug }).populate("author", "email");
    if (!article) return res.status(404).json({ message: "Not found" });

    res.json({
      ...article.toObject(),
      translation: article.translations[locale] // return only the requested locale content
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route GET /articles
 * @desc Get all articles (with both translations)
 * @access Public
 */
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().populate("author", "email");
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route POST /articles
 * @desc Add new article with FR + NL translations
 * @access Private (protected)
 */
router.post("/", protect, upload.single("coverPic"), async (req, res) => {
  try {
    const { tags, keywords, translations } = JSON.parse(req.body.data); // rest of payload as JSON
    const coverPic = req.file ? `/uploads/articles/${req.file.filename}` : null;

    if (!translations?.fr?.title || !translations?.nl?.title) {
      return res.status(400).json({ message: "Both French and Dutch titles are required" });
    }

    const article = await Article.create({
      coverPic,
      tags,
      keywords,
      translations,
      author: req.user._id,
    });

    res.status(201).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route PATCH /articles/:id
 * @desc Edit article by ID
 * @access Private (protected)
 */
router.patch("/:id", protect, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!article) return res.status(404).json({ message: "Not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route DELETE /articles/:id
 * @desc Delete article by ID
 * @access Private (protected)
 */
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
