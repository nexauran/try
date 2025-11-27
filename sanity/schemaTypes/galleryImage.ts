// schemas/galleryImage.js
export default {
  name: "galleryImage",
  title: "Gallery Image",
  type: "document",
  fields: [
    { name: "title", type: "string", title: "Title" },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "uploadedAt",
      title: "Uploaded at",
      type: "datetime",
    },
    {
      name: "notes",
      title: "Notes",
      type: "text",
    },
  ],
};
