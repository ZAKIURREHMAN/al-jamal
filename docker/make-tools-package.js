// Builds a minimal package.json with only the packages needed inside the runtime image
// to run `prisma migrate deploy` and the seed script (full dependency trees get installed).
const fs = require("fs");
const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
const keep = ["prisma", "@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs", "dotenv", "tsx"];
const pick = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => keep.includes(k)));
fs.writeFileSync(
  "package.json",
  JSON.stringify({ name: "tools", private: true, dependencies: { ...pick(p.dependencies), ...pick(p.devDependencies) } }, null, 2),
);
