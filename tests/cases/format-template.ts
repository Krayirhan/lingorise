import { formatTemplate } from "../../src/utils/formatters";
import { assert } from "../support/assertions";

assert(
  formatTemplate("{count} / {total} kelime", { count: 3, total: 20 }) === "3 / 20 kelime",
  "formatTemplate fills every named placeholder, numbers included"
);
assert(
  formatTemplate("{level} → {level}", { level: "A1" }) === "A1 → A1",
  "formatTemplate fills repeated placeholders"
);
assert(
  formatTemplate("Merhaba {name}, {unknown}", { name: "Ada" }) === "Merhaba Ada, {unknown}",
  "formatTemplate leaves placeholders without a value untouched"
);
assert(formatTemplate("Sabit metin", {}) === "Sabit metin", "formatTemplate returns text without placeholders unchanged");
