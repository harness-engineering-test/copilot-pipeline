import { renderHook, act } from "@testing-library/react-hooks";
import { useAsync } from "../useAsync";

describe("useAsync", () => {
  it("初期状態が正しいこと", () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.resolve("data"))
    );

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("実行中はloadingがtrueになること", async () => {
    let resolve: (value: string) => void;
    const promise = new Promise<string>((res) => {
      resolve = res;
    });

    const { result } = renderHook(() => useAsync(() => promise));

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolve!("data");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe("data");
  });

  it("エラー発生時にerrorがセットされること", async () => {
    const error = { code: "ERR", message: "エラー" };
    const { result } = renderHook(() =>
      useAsync(() => Promise.reject(error))
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
