// Builds a minimal package.json containing only the packages needed to run
// `prisma migrate deploy` and the seed inside the runtime image.
const fs = require("fs");
const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
const keep = ["prisma", "@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs", "dotenv", "tsx"];
const pick = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => keep.includes(k)));
fs.writeFileSync(
  "package.json",
  JSON.stringify({ name: "tools", private: true, dependencies: { ...pick(p.dependencies), ...pick(p.devDependencies) } }, null, 2),
);
