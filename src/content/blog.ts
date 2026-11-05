import type { FAQ } from "@/lib/seo";

export type Section = { heading: string; paragraphs: string[]; bullets?: string[] };
export type Article = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  published: string;
  modified: string;
  readingMinutes: number;
  intro: string[];
  sections: Section[];
  faqs: FAQ[];
  related: string[]; // product slugs
};

export const articles: Article[] = [
  {
    slug: "what-is-pure-desi-ghee",
    title: "What Is Pure Desi Ghee? How It Is Made and How to Recognise It",
    seoTitle: "What Is Pure Desi Ghee? How It Is Made",
    description: "Pure desi ghee is clarified butter made from cultured milk the traditional way. How it is made, how it differs from ordinary ghee, and what to look for.",
    excerpt: "Desi ghee starts as cultured milk, not cream. Here is what that means, how the traditional method works, and why it matters for taste and texture.",
    image: "/products/cow-ghee/cow-ghee-1kg.webp",
    imageAlt: "A jar of Al Jamal pure cow desi ghee",
    published: "2026-11-05",
    modified: "2026-11-05",
    readingMinutes: 5,
    intro: [
      "Ask ten people in Pakistan what desi ghee is and you will get ten warm answers: the smell of a grandmother's kitchen, the gloss on a hot paratha, the first spoon stirred into suji halwa. Ask what makes it “pure” and the answers get vaguer. This guide explains, plainly, what pure desi ghee is and how it is made.",
    ],
    sections: [
      {
        heading: "The short answer",
        paragraphs: [
          "Pure desi ghee is clarified butter made from milk that has first been cultured into dahi (yogurt). The dahi is churned to separate butter (makkhan), and the butter is slowly heated until the water evaporates and the milk solids settle and brown. The clear golden fat left behind is ghee. “Pure” simply means nothing else has been added: no vegetable oil, colour, flavour or preservative.",
        ],
      },
      {
        heading: "The traditional method, step by step",
        paragraphs: ["The process has four stages, and each one shapes the final taste."],
        bullets: [
          "Culturing: fresh milk is set into dahi overnight. This fermentation is what gives desi ghee its characteristic tangy, nutty aroma.",
          "Churning: the dahi is churned to separate butter from buttermilk (lassi). In the bilona method this is done by hand with a wooden churner.",
          "Slow cooking: the butter is simmered on a low flame. Water boils off, the foam subsides, and the milk solids sink and turn golden-brown.",
          "Straining and setting: the ghee is strained off the solids and left to cool naturally, which is when its grainy texture forms.",
        ],
      },
      {
        heading: "Desi ghee versus ordinary ghee",
        paragraphs: [
          "Much of the ghee sold in supermarkets is made directly from cream or from industrial butter, skipping the culturing step. It is still clarified butter, but without fermentation it tastes flatter and smells milder. Some products labelled “banaspati” or “vegetable ghee” are not dairy at all; they are hydrogenated vegetable oils. Desi ghee, by definition, is dairy made from cultured milk.",
        ],
      },
      {
        heading: "What to look for when buying",
        paragraphs: ["A few practical signs help you judge a jar before you open it, and a few more once you do."],
        bullets: [
          "Ingredients: the label should list milk or butter and nothing else.",
          "Texture: slow-cooked desi ghee usually sets with visible grains or crystals rather than a perfectly smooth, waxy surface.",
          "Colour: cow ghee is golden-yellow; buffalo ghee is creamy-white. A very bright, uniform yellow in buffalo ghee can indicate added colour.",
          "Aroma: it should smell rich and slightly caramelised, not neutral.",
          "Source: small-batch producers can tell you where the milk comes from and how the ghee is made.",
        ],
      },
      {
        heading: "How we make Al Jamal desi ghee",
        paragraphs: [
          "Al Jamal ghee is made in Lahore using the method above: cultured milk, churned butter, and slow cooking in small batches. We make cow ghee, buffalo ghee and a hand-churned bilona ghee, and every jar lists a single ingredient. You can read about each on our product pages.",
        ],
      },
    ],
    faqs: [
      { q: "Is desi ghee the same as clarified butter?", a: "Desi ghee is a type of clarified butter, but it is made from cultured milk and cooked longer until the milk solids brown, which gives it a deeper flavour than plain clarified butter." },
      { q: "Does pure desi ghee need refrigeration?", a: "No. Stored in a sealed jar in a cool, dry cupboard and handled with a dry spoon, it keeps well at room temperature until the best-before date." },
    ],
    related: ["classic-cow-desi-ghee", "bilona-hand-churned-desi-ghee"],
  },
  {
    slug: "cow-ghee-vs-buffalo-ghee",
    title: "Cow Ghee vs Buffalo Ghee: Colour, Taste and Which to Choose",
    seoTitle: "Cow Ghee vs Buffalo Ghee: Which to Buy",
    description: "Cow ghee and buffalo ghee differ in colour, flavour, texture and the dishes they suit. A clear comparison to help you choose the right desi ghee.",
    excerpt: "Golden and nutty, or creamy-white and rich? Both are pure desi ghee. The difference is in the milk, and it changes how each one cooks.",
    image: "/products/premium-buffalo.webp",
    imageAlt: "Jar of Al Jamal pure buffalo desi ghee",
    published: "2026-11-05",
    modified: "2026-11-05",
    readingMinutes: 4,
    intro: [
      "Walk into any Pakistani kitchen and you will find a strong opinion about cow ghee versus buffalo ghee. Both are made the same traditional way, so neither is “more pure” than the other. The differences come from the milk itself.",
    ],
    sections: [
      {
        heading: "Colour",
        paragraphs: [
          "Cow's milk contains beta-carotene from the animals' feed, which gives cow ghee its golden-yellow colour. Buffalo milk contains very little of it, so buffalo ghee sets to a creamy, almost white ghee. A bright yellow buffalo ghee is a sign that colour has been added.",
        ],
      },
      {
        heading: "Taste and aroma",
        paragraphs: [
          "Cow ghee has a lighter, nuttier flavour with the tang of the cultured milk coming through. Buffalo ghee is richer and fuller because buffalo milk has a higher fat content, and its aroma is heavier. Many people who grew up on village ghee associate that heavier aroma with “real” ghee; others prefer the cleaner taste of cow ghee.",
        ],
      },
      {
        heading: "Texture",
        paragraphs: [
          "Both develop grains as they cool. Cow ghee tends to set softer and more granular; buffalo ghee sets firmer and smoother at room temperature. In summer both will loosen; in winter both will be firm.",
        ],
      },
      {
        heading: "Which to use for what",
        paragraphs: ["There is no wrong answer, but these are the traditional pairings."],
        bullets: [
          "Cow ghee: dal tadka, sabzi, rotis and parathas, pulao, light halwas and everyday cooking where you want aroma without heaviness.",
          "Buffalo ghee: mithai and halwa, nihari and rich gravies, biryani, and anywhere a bold, rich flavour is the point.",
          "Mixed households: many families keep both, using cow ghee daily and buffalo ghee for special dishes.",
        ],
      },
      {
        heading: "Price",
        paragraphs: [
          "Buffalo ghee is often priced slightly higher because buffalo milk yields more fat per litre and is prized for richness. At Al Jamal both are listed by weight on their product pages so you can compare directly.",
        ],
      },
    ],
    faqs: [
      { q: "Is buffalo ghee or cow ghee better for cooking?", a: "Both work for all cooking. Cow ghee is lighter and suits everyday dishes; buffalo ghee is richer and suits sweets and heavy gravies. Choose by taste." },
      { q: "Why is my buffalo ghee white?", a: "That is its natural colour. Buffalo milk lacks the pigment that makes cow's milk and cow ghee yellow." },
    ],
    related: ["classic-cow-desi-ghee", "premium-buffalo-desi-ghee"],
  },
  {
    slug: "how-to-identify-pure-desi-ghee",
    title: "How to Identify Pure Desi Ghee: Simple Checks You Can Do at Home",
    seoTitle: "How to Identify Pure Desi Ghee at Home",
    description: "Worried your ghee is adulterated? Simple, practical checks to judge the purity of desi ghee by look, smell, texture and a few kitchen tests.",
    excerpt: "Adulterated ghee is common in Pakistan. These practical checks, from the label to the frying pan, help you tell the difference.",
    image: "/products/classic-cow-detail.webp",
    imageAlt: "Close-up of the grainy texture of pure cow desi ghee",
    published: "2026-11-05",
    modified: "2026-11-05",
    readingMinutes: 5,
    intro: [
      "Ghee is one of the most commonly adulterated foods in Pakistan: vegetable ghee (banaspati), refined oils, starch and colour are all used to stretch it. None of the home checks below is a laboratory test, but together they will catch most of the obvious problems.",
    ],
    sections: [
      {
        heading: "1. Read the ingredients",
        paragraphs: ["Start with the label. Pure desi ghee lists one ingredient: milk, butter or cultured butter. Anything mentioning vegetable fat, palm oil or “edible oil” is not pure desi ghee, however it is branded."],
      },
      {
        heading: "2. Look at the texture",
        paragraphs: ["Slow-cooked desi ghee sets with visible grains. A perfectly smooth, waxy block that looks like candle wax is more typical of hydrogenated vegetable ghee. Note that grain size varies with weather and cooling speed, so a smoother batch is not automatically suspect."],
      },
      {
        heading: "3. Check the colour",
        paragraphs: ["Cow ghee should be golden to pale yellow; buffalo ghee should be creamy-white. Uniform, bright artificial yellow in a product sold as buffalo ghee usually means added colour."],
      },
      {
        heading: "4. Smell it",
        paragraphs: ["Desi ghee has a distinct caramelised, slightly tangy aroma from the cultured milk and browned milk solids. Vegetable ghee smells flat or faintly of oil."],
      },
      {
        heading: "5. The palm test",
        paragraphs: ["Rub a small amount between your palms. Pure ghee melts quickly from body heat and absorbs; vegetable fat stays greasy and waxy for longer."],
      },
      {
        heading: "6. The heat test",
        paragraphs: ["Heat a spoonful in a pan. Pure desi ghee melts fast, turns clear and brown and releases its aroma. Adulterated ghee melts slowly, may foam or smoke early, and smells of oil."],
      },
      {
        heading: "7. The cold test",
        paragraphs: ["Melt a little ghee and let it cool in the fridge. Pure ghee sets evenly into one layer. Mixtures with oils sometimes separate into layers of different colour or firmness."],
      },
      {
        heading: "Buy from a source you can question",
        paragraphs: ["The most reliable check is knowing who made your ghee and how. A producer who will tell you where the milk comes from, how long the butter is cooked and why the texture varies is a producer with nothing to hide. That transparency is why we describe our method on every Al Jamal product page."],
      },
    ],
    faqs: [
      { q: "Does pure desi ghee freeze solid in the fridge?", a: "It becomes firm but should still be scoopable and set in a single, even layer. Separation into distinct layers can indicate mixing with other fats." },
      { q: "Is grainy ghee a sign of purity?", a: "Grain is typical of slow-cooked desi ghee, but it is not proof on its own. Use it together with the ingredients list, colour, smell and heat test." },
    ],
    related: ["classic-cow-desi-ghee", "premium-buffalo-desi-ghee"],
  },
  {
    slug: "uses-of-desi-ghee-in-cooking",
    title: "Uses of Desi Ghee: Everyday Pakistani Cooking, from Tadka to Halwa",
    seoTitle: "Uses of Desi Ghee in Pakistani Cooking",
    description: "Practical ways to cook with desi ghee: tadka, parathas, rice and biryani, halwa and mithai, frying and finishing, with tips on quantity and heat.",
    excerpt: "A spoon of ghee does different work in a dal, a paratha and a halwa. Here is how Pakistani kitchens actually use it, with practical tips.",
    image: "/products/cow-ghee/cow-ghee-range-banner.webp",
    imageAlt: "Al Jamal cow desi ghee in 200g to 5kg packs",
    published: "2026-11-05",
    modified: "2026-11-05",
    readingMinutes: 4,
    intro: [
      "Desi ghee is used in almost every part of Pakistani cooking, but it is used differently in each. Knowing when to cook with it, when to finish with it and how much to use is the difference between a dish that tastes rich and one that tastes heavy.",
    ],
    sections: [
      {
        heading: "Tadka (tempering)",
        paragraphs: ["Heat a tablespoon of ghee until it shimmers, add cumin, garlic, dried chillies or curry leaves, and pour the sizzling mixture over cooked dal, saag or a simple sabzi. Ghee carries the spice aromas better than oil and adds its own caramel note."],
      },
      {
        heading: "Rotis and parathas",
        paragraphs: ["Brush a hot roti with a little ghee as it comes off the tawa. For parathas, use ghee both in the dough and on the tawa for flaky layers. Cow ghee is the usual choice here because it is lighter."],
      },
      {
        heading: "Rice, pulao and biryani",
        paragraphs: ["Fry the whole spices and onions for pulao in ghee, or stir a spoon of ghee through plain hot rice before serving. In biryani, a final drizzle of melted ghee over the layers before dum gives aroma and gloss."],
      },
      {
        heading: "Halwa and mithai",
        paragraphs: ["Suji halwa, gajar ka halwa, besan ladoo and most traditional sweets begin by roasting the base ingredient in ghee. This is where buffalo ghee's richer flavour shines. Use enough ghee for the suji or besan to roast evenly without catching."],
      },
      {
        heading: "Frying and searing",
        paragraphs: ["Ghee has a high smoke point, so it is suitable for shallow frying parathas, puris and kebabs and for searing meat. Because the milk solids have already been removed, it does not burn as quickly as butter."],
      },
      {
        heading: "How much to use",
        paragraphs: ["Ghee is concentrated, so a little goes further than oil. One to two teaspoons for a tadka, a teaspoon per roti, and a tablespoon or two for a family pot of rice is typical. Taste as you go; good ghee should be noticeable, not dominant."],
      },
    ],
    faqs: [
      { q: "Can I use desi ghee for deep frying?", a: "Yes. Its high smoke point suits frying. Strain and reuse it once or twice at most, as flavour fades with each use." },
      { q: "Which ghee is best for halwa?", a: "Both work; buffalo ghee gives a richer result that many prefer for sweets, while cow ghee gives a lighter halwa." },
    ],
    related: ["premium-buffalo-desi-ghee", "family-pack-cow-desi-ghee"],
  },
  {
    slug: "how-to-store-desi-ghee",
    title: "How to Store Desi Ghee So It Stays Fresh",
    seoTitle: "How to Store Desi Ghee: Shelf Life & Tips",
    description: "Desi ghee keeps for months without refrigeration if stored correctly. The right container, temperature and handling, and the mistakes that spoil it.",
    excerpt: "Ghee is one of the most forgiving foods in the kitchen, but water and sunlight will ruin it. Here is how to keep it fresh to the last spoon.",
    image: "/products/gift-jar.webp",
    imageAlt: "Al Jamal desi ghee in a sealed glass gift jar",
    published: "2026-11-05",
    modified: "2026-11-05",
    readingMinutes: 3,
    intro: [
      "Because the water and milk solids have been cooked out, ghee is far more stable than butter and keeps for months at room temperature. Spoilage almost always comes from one of three things: moisture, light, or a dirty spoon.",
    ],
    sections: [
      {
        heading: "The right container",
        paragraphs: ["Glass or food-grade steel with a tight lid is ideal. If you decant from a large tin, use a clean, completely dry jar. Avoid thin plastic for long storage, and never store ghee in a container that previously held water-based foods unless it is fully dry."],
      },
      {
        heading: "Temperature and light",
        paragraphs: ["Keep ghee in a cool, dark cupboard away from the stove and direct sunlight. Heat and light speed up rancidity. Refrigeration is not necessary, but it does no harm if your kitchen is very hot; the ghee will simply become firm."],
      },
      {
        heading: "Handling",
        paragraphs: ["Always use a clean, dry spoon. A drop of water or a crumb of food introduced into the jar is the most common reason ghee develops off smells or mould. Close the lid firmly after each use."],
      },
      {
        heading: "Shelf life",
        paragraphs: ["Unopened and stored properly, desi ghee keeps until the best-before date printed on the jar, typically many months. Once opened, aim to finish it within a few months for the best flavour. Grainy texture, firmness in winter or liquidity in summer are normal changes, not signs of spoilage."],
      },
      {
        heading: "Signs that ghee has gone off",
        paragraphs: ["Trust your nose. Rancid ghee smells sharp, sour or like old oil rather than nutty and sweet. Visible mould, usually from water contamination, means the jar should be discarded."],
      },
    ],
    faqs: [
      { q: "Should desi ghee be kept in the fridge?", a: "It is not required. A cool, dark cupboard is enough. Refrigerate only if your kitchen is very hot, and expect the ghee to firm up." },
      { q: "Why has my ghee turned liquid?", a: "Ghee melts above roughly 25 to 30°C, so it becomes liquid in summer. This is normal; it will set again when cooler." },
    ],
    related: ["desi-ghee-gift-jar", "family-pack-cow-desi-ghee"],
  },
  {
    slug: "how-to-choose-quality-desi-ghee",
    title: "How to Choose Quality Desi Ghee: A Buyer's Checklist",
    seoTitle: "How to Choose Quality Desi Ghee Online",
    description: "Buying desi ghee online in Pakistan? A checklist to judge quality: ingredients, method, cow vs buffalo, pack size, price and seller transparency.",
    excerpt: "Price alone tells you little. These are the questions worth asking before you order desi ghee online, and the answers that matter.",
    image: "/products/bilona.webp",
    imageAlt: "Al Jamal hand-churned bilona desi ghee jar",
    published: "2026-11-05",
    modified: "2026-11-05",
    readingMinutes: 4,
    intro: [
      "Ordering ghee online means you cannot smell or taste it first. What you can do is ask the right questions of the listing and the seller. This checklist covers the ones that actually predict quality.",
    ],
    sections: [
      {
        heading: "1. One ingredient",
        paragraphs: ["The product should state clearly that it is made only from milk or cultured butter. If the listing is vague about ingredients, move on."],
      },
      {
        heading: "2. A described method",
        paragraphs: ["Quality producers explain how the ghee is made: cultured milk, churned butter, slow cooking. Hand-churned bilona ghee is the most traditional method and is made in smaller quantities, which is reflected in its price."],
      },
      {
        heading: "3. Cow or buffalo, stated plainly",
        paragraphs: ["The type of milk should be named. “Mixed” or unspecified ghee makes it hard to judge colour and flavour. Choose cow ghee for lighter everyday use and buffalo ghee for richer dishes."],
      },
      {
        heading: "4. Honest photographs",
        paragraphs: ["Look for images that show the real texture of the ghee, including its grain. Perfectly smooth, uniformly bright yellow product shots can be a sign of either heavy editing or an industrial product."],
      },
      {
        heading: "5. Sensible pack sizes",
        paragraphs: ["Start with a smaller jar, 500g or 1kg, to try a new producer. Once you know you like it, larger family packs offer better value per kilogram and fewer deliveries."],
      },
      {
        heading: "6. Price that reflects the milk",
        paragraphs: ["It takes many litres of milk to make a kilogram of ghee, so very cheap “desi ghee” is almost always cut with something else. Compare prices per kilogram between sellers rather than per jar."],
      },
      {
        heading: "7. A seller you can reach",
        paragraphs: ["A phone number, a WhatsApp line and clear delivery and payment terms matter. Cash on delivery lets you inspect the jar before paying. Reviews from real customers help, but a seller who answers questions is the better signal."],
      },
    ],
    faqs: [
      { q: "Is more expensive desi ghee always better?", a: "Not always, but very cheap ghee is almost always adulterated. Judge price per kilogram alongside ingredients, method and the seller's transparency." },
      { q: "What pack size should I buy first?", a: "A 500g or 1kg jar is enough to judge the taste and texture of a new producer before committing to a larger pack." },
    ],
    related: ["bilona-hand-churned-desi-ghee", "classic-cow-desi-ghee"],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
