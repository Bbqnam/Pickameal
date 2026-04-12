import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RollaMeal from "@/pages/RollaMeal";
import type { Recipe } from "@/types/recipe";

const mockUseApp = vi.fn();

vi.mock("@/context/AppContext", () => ({
  useApp: () => mockUseApp(),
}));

const buildRecipe = (overrides: Partial<Recipe> & Pick<Recipe, "id" | "title" | "ingredients">): Recipe => ({
  id: overrides.id,
  title: overrides.title,
  cuisine: overrides.cuisine ?? "Asian",
  mealType: overrides.mealType ?? "Dinner",
  cookingTime: overrides.cookingTime ?? 20,
  difficulty: overrides.difficulty ?? "Easy",
  ingredients: overrides.ingredients,
  instructions: overrides.instructions ?? ["Cook and serve."],
  image: overrides.image ?? "/placeholder.jpg",
  tags: overrides.tags ?? [],
});

describe("RollaMeal rolling interactions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);

    mockUseApp.mockReturnValue({
      recipes: [
        buildRecipe({
          id: "chicken-rice",
          title: "Chicken Rice Bowl",
          ingredients: ["Chicken", "Rice"],
        }),
      ],
      scoreRecipe: () => 0,
      toggleSaved: vi.fn(),
      isSaved: () => false,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    mockUseApp.mockReset();
  });

  it("stops after a tap-triggered auto roll", async () => {
    render(
      <MemoryRouter>
        <RollaMeal />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /roll a meal/i }));

    const rollButton = screen.getByRole("button", { name: /hold or tap to roll/i });
    fireEvent.pointerDown(rollButton);
    fireEvent.pointerUp(rollButton);

    expect(screen.getByRole("button", { name: /release to stop/i })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText(/your pick is in/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /release to stop/i })).not.toBeInTheDocument();
  });
});
