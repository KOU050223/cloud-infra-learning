import { describe, expect, it } from "vite-plus/test";
import { glossary, parseTermText } from "./glossary";

describe("parseTermText", () => {
  it("[[id|表示]] を用語に分ける", () => {
    expect(parseTermText("世界中の[[edge|エッジ]]で動く")).toEqual([
      { text: "世界中の" },
      { id: "edge", text: "エッジ" },
      { text: "で動く" },
    ]);
  });

  it("表示名を省くと辞書の見出しを使う", () => {
    expect(parseTermText("[[d1]]")).toEqual([{ id: "d1", text: glossary.d1.term }]);
  });

  it("数字を含む id も扱える", () => {
    expect(parseTermText("[[r2|R2]]（ストレージ）")).toEqual([
      { id: "r2", text: "R2" },
      { text: "（ストレージ）" },
    ]);
  });

  it("辞書にない id は地の文として残す", () => {
    expect(parseTermText("[[nope|ふつう]]の文")).toEqual([{ text: "ふつう" }, { text: "の文" }]);
  });

  it("用語がなければ1つの地の文", () => {
    expect(parseTermText("ただの文")).toEqual([{ text: "ただの文" }]);
  });
});
