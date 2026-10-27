import { describe, expect, it } from "vitest";
import { blogPosts, blogTags, filterPostsByTag, findPost, validateBlogFrontmatter } from "./blog";

describe("blog content", () => {
  it("registers the MSW post with valid frontmatter and a cover", () => {
    const post = findPost("ship-faster-with-msw");
    expect(post?.frontmatter.title).toBe("Ship faster with MSW");
    expect(post?.frontmatter.tags).toEqual(["React", "Testing", "MSW"]);
    expect(post?.cover.url).toMatch(/^\/__l5e\/assets-v1\//);
    for (const p of blogPosts) expect(validateBlogFrontmatter(p.frontmatter)).toEqual([]);
  });

  it("rejects frontmatter missing a title, bad date or no tags", () => {
    const errors = validateBlogFrontmatter({
      title: "",
      description: "d",
      publishedAt: "yesterday",
      readingMinutes: 0,
      tags: [],
    });
    expect(errors).toHaveLength(4);
  });

  it("lists posts newest first", () => {
    const dates = blogPosts.map((p) => p.frontmatter.publishedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("filters by tag case-insensitively and returns all for no tag", () => {
    expect(filterPostsByTag(blogPosts, "testing").map((p) => p.slug)).toContain(
      "ship-faster-with-msw",
    );
    expect(filterPostsByTag(blogPosts, "rust")).toEqual([]);
    expect(filterPostsByTag(blogPosts, "")).toEqual(blogPosts);
  });

  it("collects unique sorted tags", () => {
    expect(blogTags(blogPosts)).toEqual(["MSW", "React", "Testing"]);
  });

  it("returns undefined for unknown slugs", () => {
    expect(findPost("nope")).toBeUndefined();
  });
});
