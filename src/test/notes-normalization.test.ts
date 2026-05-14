import { describe, it, expect } from "vitest";
import { normalizeNotesInput } from "@/pages/Inventory";

describe("normalizeNotesInput (typing-time notes normalization)", () => {
  describe("leading whitespace", () => {
    it("strips a single leading space immediately", () => {
      expect(normalizeNotesInput(" hello")).toBe("hello");
    });

    it("strips multiple leading spaces immediately", () => {
      expect(normalizeNotesInput("     hello")).toBe("hello");
    });

    it("strips leading tabs and newlines", () => {
      expect(normalizeNotesInput("\t\nhello")).toBe("hello");
    });

    it("strips mixed leading whitespace before the first word", () => {
      expect(normalizeNotesInput(" \t \n  hello world")).toBe("hello world");
    });
  });

  describe("trailing whitespace", () => {
    it("strips a single trailing space immediately", () => {
      expect(normalizeNotesInput("hello ")).toBe("hello");
    });

    it("strips multiple trailing spaces immediately", () => {
      expect(normalizeNotesInput("hello     ")).toBe("hello");
    });

    it("strips trailing tabs and newlines", () => {
      expect(normalizeNotesInput("hello\t\n")).toBe("hello");
    });

    it("strips mixed trailing whitespace after the last word", () => {
      expect(normalizeNotesInput("hello world \t \n  ")).toBe("hello world");
    });
  });

  describe("internal spacing is preserved", () => {
    it("keeps a single space between words", () => {
      expect(normalizeNotesInput("hello world")).toBe("hello world");
    });

    it("keeps multiple spaces between words exactly as typed", () => {
      expect(normalizeNotesInput("hello   world")).toBe("hello   world");
    });

    it("keeps internal tabs between words", () => {
      expect(normalizeNotesInput("hello\tworld")).toBe("hello\tworld");
    });

    it("preserves internal spacing while still stripping outer whitespace", () => {
      expect(normalizeNotesInput("   hello   world   ")).toBe("hello   world");
    });

    it("preserves internal newlines between words", () => {
      expect(normalizeNotesInput("hello\nworld")).toBe("hello\nworld");
    });
  });

  describe("whitespace-only and empty input", () => {
    it("collapses a single space to empty string", () => {
      expect(normalizeNotesInput(" ")).toBe("");
    });

    it("collapses many spaces to empty string", () => {
      expect(normalizeNotesInput("        ")).toBe("");
    });

    it("collapses mixed whitespace-only input to empty string", () => {
      expect(normalizeNotesInput(" \t \n \t ")).toBe("");
    });

    it("returns empty string unchanged", () => {
      expect(normalizeNotesInput("")).toBe("");
    });
  });

  describe("typing-time progression (simulated keystroke-by-keystroke)", () => {
    it("never holds leading whitespace as the user types a word", () => {
      const keystrokes = [" ", " h", " he", " hel", " hell", " hello"];
      const normalized = keystrokes.map(normalizeNotesInput);
      expect(normalized).toEqual(["", "h", "he", "hel", "hell", "hello"]);
    });

    it("never holds trailing whitespace at any point during typing", () => {
      const keystrokes = ["h", "he", "hel", "hell", "hello", "hello "];
      const normalized = keystrokes.map(normalizeNotesInput);
      expect(normalized).toEqual(["h", "he", "hel", "hell", "hello", "hello"]);
    });

    it("preserves internal multi-space as the user types between words", () => {
      const keystrokes = ["hello", "hello ", "hello  ", "hello  w", "hello  wo"];
      const normalized = keystrokes.map(normalizeNotesInput);
      expect(normalized).toEqual(["hello", "hello", "hello", "hello  w", "hello  wo"]);
    });
  });

  describe("paste scenarios", () => {
    it("strips outer whitespace from pasted text but keeps internal layout", () => {
      expect(normalizeNotesInput("   stocked   weekend   rush   ")).toBe(
        "stocked   weekend   rush",
      );
    });

    it("keeps internal newlines from a multi-line paste", () => {
      expect(normalizeNotesInput("\n\nline1\nline2\n\n")).toBe("line1\nline2");
    });
  });
});

import { normalizeNotesForStorage } from "@/pages/Inventory";

describe("normalizeNotesForStorage (persistence-time normalization)", () => {
  it("trims outer whitespace", () => {
    expect(normalizeNotesForStorage("   hello world   ")).toBe("hello world");
  });

  it("collapses internal repeated spaces to a single space", () => {
    expect(normalizeNotesForStorage("hello   world")).toBe("hello world");
  });

  it("collapses internal tabs and newlines to a single space", () => {
    expect(normalizeNotesForStorage("hello\t\tworld\nfoo")).toBe("hello world foo");
  });

  it("trims and collapses combined", () => {
    expect(normalizeNotesForStorage("   hello\t\t  world  \n  ")).toBe("hello world");
  });

  it("collapses whitespace-only input to empty string", () => {
    expect(normalizeNotesForStorage("   \t\n  ")).toBe("");
  });

  it("returns empty string unchanged", () => {
    expect(normalizeNotesForStorage("")).toBe("");
  });

  it("leaves a clean single-spaced string untouched", () => {
    expect(normalizeNotesForStorage("hello world")).toBe("hello world");
  });
});
