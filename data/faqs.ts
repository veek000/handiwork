// Help & Support FAQs for the dashboards. Same answers as the public FAQ page
// (public/faq.html), grouped by topic; `for` limits a question to one role.
export type FaqTopic = "start" | "payments" | "safety" | "account" | "providers";

export type Faq = { q: string; a: string; topic: FaqTopic; for?: "customer" | "vendor" };

export const FAQ_TOPICS: { value: FaqTopic; label: string }[] = [
  { value: "start", label: "Getting Started" },
  { value: "payments", label: "Payments & Escrow" },
  { value: "safety", label: "Safety & Trust" },
  { value: "account", label: "Account & Reviews" },
  { value: "providers", label: "For Providers" },
];

export const FAQS: Faq[] = [
  { topic: "start", q: "What is Handiwork?", a: "Handiwork connects homeowners with verified local professionals for any home service, and lets you manage the whole job (quote, booking and payment) in one place." },
  { topic: "start", q: "What types of projects can I do with Handiwork?", a: "Almost any home service: carpentry, plumbing, painting, roofing, electrical work, cleaning, gardening and more. Describe the job and trusted pros nearby send you quotes." },
  { topic: "start", for: "customer", q: "How do I request a service?", a: "Search for the service you need from Home, open a provider, and tap Book Service. Describe the job and the provider reviews it and sends you a quote in Messages." },
  { topic: "start", q: "Is Handiwork free to use?", a: "Creating an account and requesting quotes is free. You only pay for the service you book, with funds held safely in escrow until the job is done." },
  { topic: "payments", q: "How does the escrow payment system work?", a: "When a quote is accepted, the funds go into a secure escrow account. The money is only released to the provider after the customer confirms the job is complete." },
  { topic: "payments", q: "When is the professional paid?", a: "Payment is released from escrow the moment the customer marks the job complete. Never before." },
  { topic: "payments", q: "What payment methods are accepted?", a: "Major debit and credit cards and bank transfer. The exact options for your region are shown at checkout." },
  { topic: "payments", q: "Are there any hidden fees?", a: "None. The provider's quote is shown up front and approved before any funds move into escrow." },
  { topic: "safety", q: "How do you verify your artisans?", a: "Every professional goes through verification: we confirm identity, credentials and work history, and you can read ratings from other users before booking." },
  { topic: "safety", for: "customer", q: "What if I'm not happy with the service?", a: "Funds stay in escrow until you confirm the job is done, so you're in control. If something isn't right, contact support and we'll help reach a fair resolution." },
  { topic: "safety", q: "How do I report a safety concern?", a: "Contact our support team (available around the clock) by email or phone below. We take every report seriously and act quickly." },
  { topic: "account", q: "How do the ratings and reviews work?", a: "After every completed job the customer can rate and review the provider, and providers can reply. It keeps quality high for everyone." },
  { topic: "account", q: "How do you protect my personal information?", a: "Your data is encrypted and never shared without your consent. We only use it to connect you with the right people and keep your account secure." },
  { topic: "account", for: "customer", q: "Can I cancel a request?", a: "Yes. You can cancel from My Jobs before work begins at no charge." },
  { topic: "account", q: "How do I update my account details?", a: "Open Settings from your profile menu (or the side menu on mobile) to change your profile, notification preferences and password." },
  { topic: "account", q: "How do I change my password?", a: "Go to Settings, then Security, and use Change password. Your other devices are signed out when you do." },
  { topic: "providers", for: "vendor", q: "How and when do I get paid?", a: "Once the customer confirms the job is complete, the funds are released from escrow to your wallet." },
  { topic: "providers", for: "vendor", q: "What does Handiwork charge providers?", a: "A transparent service fee per completed job. The amount is shown before you accept any work, with no hidden deductions." },
  { topic: "providers", for: "vendor", q: "How do I get the verified badge?", a: "Submit your government ID during sign-up or through support. Once it's checked, the badge appears on your profile and services." },
  { topic: "providers", for: "vendor", q: "How do I grow my business on Handiwork?", a: "Keep your services and bio up to date, reply to requests quickly, and do great work. Strong reviews compound quickly." },
];

export const SUPPORT_CONTACT = {
  email: "hello@handiwork.com",
  phone: "+234 800 123 4567",
  phoneHref: "tel:+2348001234567",
  hours: "Support available 24/7",
};
