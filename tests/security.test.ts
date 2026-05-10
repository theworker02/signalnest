import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { issueAccessToken, issueRefreshToken } from "../backend/src/lib/security.ts";

describe("security token helpers", () => {
  it("issues distinct access and refresh tokens", () => {
    const access = issueAccessToken("usr_test", "ses_test");
    const refresh = issueRefreshToken("usr_test", "ses_test", "fam_test");

    assert.notEqual(access, refresh);
    assert.equal(access.split(".").length, 3);
    assert.equal(refresh.split(".").length, 3);
  });
});
