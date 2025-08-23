import mongoose from "mongoose";
import slugify from "slugify";

const translationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String, unique: false } 
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    coverPic: { type: String, required: false },

    // Translations only (French + Dutch)
    translations: {
      fr: { type: translationSchema, required: true },
      nl: { type: translationSchema, required: true }
    },

    tags: [{ type: String, trim: true }],
    keywords: [{ type: String }],

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

// Auto-generate slug for each language
articleSchema.pre("save", function (next) {
  ["fr", "nl"].forEach((lang) => {
    const translation = this.translations[lang];
    if (translation && translation.title && !translation.slug) {
      translation.slug = slugify(translation.title, { lower: true, strict: true });
    }
  });
  next();
});

// Auto-generate metaDescription if missing
articleSchema.pre("save", function (next) {
  ["fr", "nl"].forEach((lang) => {
    const translation = this.translations[lang];
    if (translation && !translation.metaDescription && translation.content) {
      translation.metaDescription = translation.content
        .substring(0, 160)
        .replace(/<\/?[^>]+(>|$)/g, ""); // strip HTML
    }
  });
  next();
});

const Article = mongoose.model("Article", articleSchema);
export default Article;
