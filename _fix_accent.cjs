const fs = require("fs");
const path = "src/components/ProtectedRoute.tsx";
let s = fs.readFileSync(path, "utf8");
s = s.replace(
  /V.?rification de l'authentification\.\.\./,
  "V\u00e9rification de l'authentification..."
);
fs.writeFileSync(path, s);
console.log(fs.readFileSync(path, "utf8"));
