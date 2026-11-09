import { describe, expect, it } from "vite-plus/test";
import { handleRequest } from "./honoRouter";

describe("handleRequest", () => {
  it("/ はあいさつを返す", () => {
    expect(handleRequest("GET", "/")).toEqual({
      status: 200,
      body: { message: "Hello Hono!" },
      matched: "/",
    });
  });

  it("/hello/:name はパラメータを埋め込む（URLデコードもする）", () => {
    expect(handleRequest("GET", "/hello/taro").body).toEqual({ message: "Hello, taro!" });
    expect(handleRequest("GET", "/hello/%E5%A4%AA%E9%83%8E").body).toEqual({
      message: "Hello, 太郎!",
    });
  });

  it("クエリ文字列と末尾スラッシュは無視する", () => {
    expect(handleRequest("GET", "/health?x=1").status).toBe(200);
    expect(handleRequest("GET", "/health/").status).toBe(200);
  });

  it("未定義のパスは 404", () => {
    expect(handleRequest("GET", "/users")).toEqual({
      status: 404,
      body: { error: "Not Found" },
      matched: null,
    });
    expect(handleRequest("GET", "/hello").status).toBe(404);
  });

  it("GET 以外は 405", () => {
    expect(handleRequest("POST", "/health").status).toBe(405);
  });

  it("壊れたパーセントエンコードでも落ちない", () => {
    expect(handleRequest("GET", "/hello/%E0%A4%A").body).toEqual({ message: "Hello, %E0%A4%A!" });
  });
});
