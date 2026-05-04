import { apiRequest } from "../client";

global.fetch = jest.fn();

describe("apiRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GETリクエストが正常に処理されること", async () => {
    const mockData = { data: { id: 1, name: "test" } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await apiRequest<{ id: number; name: string }>("/test");

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("Authorizationヘッダーがtokenとともに送信されること", async () => {
    const mockData = { data: {} };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    await apiRequest("/secure", { token: "my-token" });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-token",
        }),
      })
    );
  });

  it("レスポンスがエラーの場合にスローすること", async () => {
    const apiError = { code: "NOT_FOUND", message: "見つかりません" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(apiError),
    });

    await expect(apiRequest("/missing")).rejects.toEqual(apiError);
  });
});
