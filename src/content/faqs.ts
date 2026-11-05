import type { FAQ } from "@/lib/seo";

/** General FAQs shown on the homepage (also used for FAQPage structured data). */
export const homeFaqs: FAQ[] = [
  {
    q: "What is pure desi ghee?",
    a: "Pure desi ghee is clarified butter made the traditional way: milk is cultured into dahi (yogurt), churned into butter, and the butter is slow-cooked until the water evaporates and the milk solids brown. What remains is golden, aromatic ghee with nothing added.",
  },
  {
    q: "How is Al Jamal desi ghee made?",
    a: "We culture fresh milk into dahi, churn it into makkhan (butter), and simmer the butter over a low flame in small batches until it turns golden and fragrant. It is then strained and jarred. No colour, flavouring, preservatives or vegetable oil are added.",
  },
  {
    q: "What is the difference between cow ghee and buffalo ghee?",
    a: "Cow ghee is golden-yellow with a lighter, nutty flavour and a naturally grainy texture. Buffalo ghee is creamy-white with a richer, fuller taste because buffalo milk has a higher fat content. Both are made the same traditional way; the choice comes down to taste and what you cook.",
  },
  {
    q: "Why does desi ghee look grainy?",
    a: "A grainy texture is a natural sign of slow-cooked desi ghee. Crystals form as the ghee cools; it can look smoother or grainier depending on the temperature at which it set and the season. It does not affect quality.",
  },
  {
    q: "How should I store desi ghee and how long does it last?",
    a: "Keep the jar sealed in a cool, dry cupboard away from sunlight and always use a clean, dry spoon. Ghee does not need refrigeration. The best-before date is printed on every jar.",
  },
  {
    q: "How can I buy desi ghee online and pay?",
    a: "Choose a product and weight, add it to your cart and check out with your name, phone number and address. We currently offer Cash on Delivery only: you pay the rider in cash when the order arrives. No advance payment is required.",
  },
  {
    q: "Where do you deliver and how long does it take?",
    a: "We deliver across Pakistan. Orders are confirmed by phone, usually within a day, and delivered in 2 to 5 working days depending on your city. Delivery within Lahore is usually faster.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Yes. Call or WhatsApp us with your order number before the order is shipped and we will update or cancel it for you.",
  },
];

/** Lahore-specific FAQs for the local landing page. */
export const lahoreFaqs: FAQ[] = [
  {
    q: "Do you deliver pure desi ghee in Lahore?",
    a: "Yes. Al Jamal is based in Lahore and delivers desi ghee to all major areas of the city, including DHA, Gulberg, Johar Town, Model Town, Bahria Town, Cantt, Wapda Town, Valencia, Allama Iqbal Town, Township and the Walled City.",
  },
  {
    q: "How long does delivery take in Lahore?",
    a: "Orders within Lahore are usually confirmed by phone the same day and delivered within 1 to 2 working days.",
  },
  {
    q: "What are the delivery charges in Lahore?",
    a: "A flat delivery charge applies to every order, and delivery is free when your order reaches the free-delivery threshold shown in your cart. The exact amount is always displayed before you place the order.",
  },
  {
    q: "What is the price of desi ghee in Lahore?",
    a: "Our prices are the same across Pakistan and are shown on each product page by weight (500g, 1kg, 2kg and larger packs). Prices depend on the type: cow ghee, buffalo ghee or hand-churned bilona ghee.",
  },
  {
    q: "Can I pay cash on delivery in Lahore?",
    a: "Yes. Every order in Lahore is Cash on Delivery. You pay the rider when your ghee arrives.",
  },
  {
    q: "Can I order in bulk for a wedding or restaurant in Lahore?",
    a: "Yes. For bulk or recurring orders, contact us on WhatsApp and we will arrange pricing and delivery.",
  },
];

/** Product-type FAQs appended to product pages, chosen by the product slug. */
export const cowGheeFaqs: FAQ[] = [
  {
    q: "What colour and texture should pure cow desi ghee have?",
    a: "Pure cow ghee is golden-yellow with a nutty aroma and a naturally grainy texture that forms as it cools. Colour varies slightly from batch to batch with the season and the cows' feed.",
  },
  {
    q: "What is cow ghee best used for?",
    a: "Cow ghee suits everyday cooking: tadka for dal and vegetables, parathas and rotis, pulao and biryani, and halwa. Its clean flavour does not overpower lighter dishes.",
  },
];

export const buffaloGheeFaqs: FAQ[] = [
  {
    q: "Why is buffalo ghee white instead of yellow?",
    a: "Buffalo milk contains little of the pigment that gives cow's milk its yellow tint, so buffalo ghee sets to a creamy white. The colour is natural and not a sign of adulteration.",
  },
  {
    q: "What is buffalo ghee best used for?",
    a: "Buffalo ghee has a richer, fuller flavour and is traditionally preferred for sweets such as halwa and mithai, rich gravies and biryani.",
  },
];

export const bilonaGheeFaqs: FAQ[] = [
  {
    q: "What does bilona mean?",
    a: "Bilona is the traditional method of churning curd by hand with a wooden churner to separate butter, which is then slow-cooked into ghee. It uses more milk and more time than machine separation, which is why true bilona ghee is made in small quantities.",
  },
];

export const generalProductFaqs: FAQ[] = [
  {
    q: "How is this ghee packed and delivered?",
    a: "Each jar is sealed at our facility and shipped in protective packaging. Orders are delivered across Pakistan in 2 to 5 working days, usually 1 to 2 days within Lahore, and paid for in cash on delivery.",
  },
  {
    q: "Does it need to be refrigerated?",
    a: "No. Keep the jar sealed in a cool, dry cupboard away from sunlight and always use a clean, dry spoon.",
  },
];

export function productFaqsFor(slug: string): FAQ[] {
  const s = slug.toLowerCase();
  const typeFaqs = s.includes("buffalo") ? buffaloGheeFaqs : s.includes("bilona") ? bilonaGheeFaqs : cowGheeFaqs;
  return [...typeFaqs, ...generalProductFaqs];
}
