export type PasswordRule = {
  label: string
  description: string
  test: (password: string) => boolean
}

export const passwordRules: PasswordRule[] = [
  {
    label: "At least 8 characters",
    description: "Use 8 or more characters.",
    test: (password) => password.length >= 8,
  },
  {
    label: "Not only numbers",
    description: "Include letters or symbols, not just numbers.",
    test: (password) => !/^\d+$/.test(password),
  },
]

export const passwordBackendNote = "Tip: avoid common words and passwords you use elsewhere."

export function getPasswordRuleStates(password: string) {
  return passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }))
}

export function getPasswordStrengthLabel(password: string) {
  const passedRules = getPasswordRuleStates(password).filter((rule) => rule.passed).length

  if (password.length === 0) {
    return "Start typing a password"
  }

  if (passedRules >= passwordRules.length) {
    return "Looks good"
  }

  if (passedRules >= 2) {
    return "Nearly there"
  }

  return "Needs work"
}

export function getPasswordStrengthTone(password: string) {
  const passedRules = getPasswordRuleStates(password).filter((rule) => rule.passed).length

  if (password.length === 0) {
    return "muted"
  }

  if (passedRules >= passwordRules.length) {
    return "success"
  }

  if (passedRules >= 2) {
    return "warning"
  }

  return "danger"
}