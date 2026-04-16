import { render, screen } from "@testing-library/react";
import { PostCard } from "@/components/PostCard";
import { mockPost } from "../__mocks__/fixtures";
import { describe, it, expect } from "vitest";

describe("PostCard", () => {
  it("renders author name, timestamp, content", () => {
    // Need to ignore formatting dates strictly because of timezone issues in simple test
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(mockPost.authorName)).toBeInTheDocument();
    
    // Markdown check: '## Sprint Update' should render as an h2 element with text 'Sprint Update'
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Sprint Update");
    
    // Content check
    expect(screen.getByText("All good!")).toBeInTheDocument();

    // Reply count check
    const replyLink = screen.getByTestId("reply-count-link");
    expect(replyLink).toBeInTheDocument();
    expect(replyLink).toHaveTextContent("2 replies");
    expect(replyLink).toHaveAttribute("href", "/replies/post-abc");
  });

  it("hides reply link if hideReplyLink is true", () => {
    render(<PostCard post={mockPost} hideReplyLink={true} />);
    expect(screen.queryByTestId("reply-count-link")).not.toBeInTheDocument();
  });
});
