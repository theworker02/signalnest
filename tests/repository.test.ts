import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paginate, trackerStore } from "../backend/src/lib/repository.ts";

describe("backend repository helpers", () => {
  it("paginates rows with a next cursor", () => {
    const result = paginate(
      [
        { id: "a", value: 1 },
        { id: "b", value: 2 },
        { id: "c", value: 3 },
      ],
      { limit: 2 },
      (row) => row.id,
    );

    assert.equal(result.data.length, 2);
    assert.equal(result.nextCursor, "b");
  });

  it("continues after a cursor", () => {
    const result = paginate(
      [
        { id: "a", value: 1 },
        { id: "b", value: 2 },
        { id: "c", value: 3 },
      ],
      { cursor: "b", limit: 2 },
      (row) => row.id,
    );

    assert.deepEqual(result.data.map((row) => row.id), ["c"]);
    assert.equal(result.nextCursor, null);
  });

  it("starts with usable tracker seed records", () => {
    assert.ok(trackerStore.length >= 2);
    assert.ok(trackerStore.every((tracker) => tracker.enabled));
  });
});
