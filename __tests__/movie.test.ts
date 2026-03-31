import { describe, it, expect } from "vitest";
import { fetchPopularMovies } from "../src/api/fetchMovies.ts";

describe("인기 영화 목록 테스트", () => {
  it("인기 있는 영화 목록을 가져온다", async () => {
    // given

    // when
    const movies = await fetchPopularMovies(1);

    // then
    expect(movies.length).toBe(20);
  });
});
