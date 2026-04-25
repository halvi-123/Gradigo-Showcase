import { validateMoney, validateIncome, roundMoney, blockNegativeInput, MAX_MONEY, MONEY_STEP } from "@/lib/budget-planner/validation"

describe("validateMoney", () => {
  it("returns null for a valid amount", () => {
    expect(validateMoney("100")).toBeNull()
    expect(validateMoney("99.99")).toBeNull()
    expect(validateMoney("0.01")).toBeNull()
  })

  it("returns error when required field is empty", () => {
    expect(validateMoney("", "Amount", true)).toBe("Amount is required.")
    expect(validateMoney("", "Amount")).toBe("Amount is required.")
  })

  it("returns null when optional field is empty", () => {
    expect(validateMoney("", "Amount", false)).toBeNull()
  })

  it("returns error for non-numeric input", () => {
    expect(validateMoney("abc", "Amount")).toBe("Amount must be a valid number.")
  })

  it("returns error for negative amount", () => {
    expect(validateMoney("-1", "Amount")).toBe("Amount cannot be negative.")
  })

  it("returns error when amount exceeds MAX_MONEY", () => {
    expect(validateMoney("99999999.99")).toBeNull()
    expect(validateMoney("100000000", "Amount")).toBe("Amount is too large.")
  })

  it("returns error for more than 2 decimal places", () => {
    expect(validateMoney("10.123", "Amount")).toBe("Amount can have at most 2 decimal places.")
    expect(validateMoney("10.12", "Amount")).toBeNull()
  })

  it("uses custom field name in error messages", () => {
    expect(validateMoney("", "Spending limit", true)).toBe("Spending limit is required.")
    expect(validateMoney("-1", "Target amount")).toBe("Target amount cannot be negative.")
  })
})

describe("validateIncome", () => {
  it("returns null for valid income", () => {
    expect(validateIncome("2200")).toBeNull()
    expect(validateIncome("1500.50")).toBeNull()
  })

  it("returns error for zero income", () => {
    expect(validateIncome("0")).toBe("Income must be greater than £0.")
  })

  it("returns error for negative income", () => {
    expect(validateIncome("-100")).toBe("Income cannot be negative.")
  })

  it("returns error for empty income", () => {
    expect(validateIncome("")).toBe("Income is required.")
  })

  it("returns error for income exceeding max", () => {
    expect(validateIncome("100000000")).toBe("Income is too large.")
  })
})

describe("roundMoney", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundMoney(10.005)).toBe(10.01)
    expect(roundMoney(10.004)).toBe(10)
    expect(roundMoney(1.235)).toBe(1.24)
  })

  it("leaves already rounded numbers unchanged", () => {
    expect(roundMoney(100)).toBe(100)
    expect(roundMoney(99.99)).toBe(99.99)
    expect(roundMoney(0.01)).toBe(0.01)
  })
})

describe("blockNegativeInput", () => {
  function makeKeyEvent(key: string): React.KeyboardEvent<HTMLInputElement> {
    const event = {
      key,
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent<HTMLInputElement>
    return event
  }

  it("prevents default for minus key", () => {
    const event = makeKeyEvent("-")
    blockNegativeInput(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it("prevents default for e key (scientific notation)", () => {
    const event = makeKeyEvent("e")
    blockNegativeInput(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it("prevents default for E key", () => {
    const event = makeKeyEvent("E")
    blockNegativeInput(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it("prevents default for plus key", () => {
    const event = makeKeyEvent("+")
    blockNegativeInput(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it("does not prevent default for valid number keys", () => {
    const event = makeKeyEvent("5")
    blockNegativeInput(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it("does not prevent default for backspace", () => {
    const event = makeKeyEvent("Backspace")
    blockNegativeInput(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })
})

describe("constants", () => {
  it("MAX_MONEY is 99999999.99", () => {
    expect(MAX_MONEY).toBe(99999999.99)
  })

  it("MONEY_STEP is 0.01", () => {
    expect(MONEY_STEP).toBe(0.01)
  })
})