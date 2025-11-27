export default {
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    { name: "paymentId", type: "string", title: "Payment ID" },
    { name: "amount", type: "number", title: "Amount (paise)" },
    { name: "currency", type: "string", title: "Currency" },
    { name: "method", type: "string", title: "Payment Method" },
    { name: "status", type: "string", title: "Status" },
    { name: "meta", type: "object", title: "Meta" },
    { name: "attachmentUrl", type: "url", title: "Attachment URL" },

    // ✅ UNKNOWN FIELD #1 → now added
    {
      name: "email",
      type: "string",
      title: "Customer Email",
      
    },

    // Already existed in DB → now defined
    {
      name: "createdAt",
      type: "datetime",
      title: "Created At",
    },

    // ✅ UNKNOWN FIELD #2 → now added
    {
      name: "default",
      type: "boolean",
      title: "Default",
      description: "Legacy field stored in database.",
      initialValue: false,
    },
  ],
};
