import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchPopularMovies,
  fetchSearchedMovies,
} from "../src/api/fetchMovies.ts";

describe("영화 목록 테스트", () => {
  it("인기 있는 영화 목록을 가져온다", async () => {
    // given

    // when
    const movies = await fetchPopularMovies(1);

    // then
    expect(movies.movies.length).toBe(20);
  });

  it("검색어에 맞는 영화만 가져온다.", async () => {
    // given

    // when
    const movies = await fetchSearchedMovies(1, "인사이드");

    // then
    expect(movies.movies.length).toBe(20);
  });
});

describe("영화 목록 API 에러 테스트", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("인기 영화 목록 요청 실패 시(500 에러) 정의된 에러 메시지를 던진다.", async () => {
    // given
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    // when & then
    await expect(fetchPopularMovies(1)).rejects.toThrow(
      "영화를 불러오는 데 실패했습니다.",
    );
  });

  it("영화 검색 실패 시(404 에러) 상태 코드를 포함한 에러 메시지를 던진다.", async () => {
    // given
    const status = 404;
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: status,
    } as Response);

    // when & then
    await expect(fetchSearchedMovies(1, "인사이드")).rejects.toThrow(
      `영화 검색 중 에러가 발생했습니다.`,
    );
  });

  it("네트워크 장애(Network Error) 발생 시 에러를 던진다.", async () => {
    // given
    vi.mocked(fetch).mockRejectedValue(new Error("Network Error"));

    // when & then
    await expect(fetchPopularMovies(1)).rejects.toThrow("Network Error");
  });
});
