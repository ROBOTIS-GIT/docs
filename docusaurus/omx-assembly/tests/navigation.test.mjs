import test from "node:test";
import assert from "node:assert/strict";
import { assemblySearch } from "../src/navigation.mjs";

test("deep links preserve valid variant and step, without accepting arbitrary destinations", () => {
  assert.equal(
    assemblySearch(
      "?model=follower&converter=xl4015&step=70&redirect=https://example.com",
    ),
    "model=follower&converter=xl4015&step=70",
  );
  assert.equal(
    assemblySearch("?model=leader&converter=xl4015&step=5"),
    "model=leader&step=5",
  );
  for (const step of ["-1", "NaN", "Infinity", "1.2", "1001"]) {
    assert.equal(assemblySearch(`?model=unknown&step=${step}`), "model=leader");
  }
});
