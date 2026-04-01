import { describe, it, expect } from "vitest";
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
    expect(movies.length).toBe(20);
  });

  it("검색어에 맞는 영화만 가져온다.", async () => {
    // given

    // when
    const movies = await fetchSearchedMovies(1, "인사이드");

    // then
    expect(movies.length).toBe(20);
  });
});
