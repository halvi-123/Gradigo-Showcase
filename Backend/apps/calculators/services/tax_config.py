TAX_YEAR = "2026-2027"

PERSONAL_ALLOWANCE = 12_570.00

REST_OF_UK_BANDS = [
    (12_570.00, 50_270.00, 0.20),
    (50_270.00, 125_140.00, 0.40),
    (125_140.00, float("inf"), 0.45),
]

SCOTLAND_BANDS = [
    (12_570.00, 15_397.00, 0.19),
    (15_397.00, 27_491.00, 0.20),
    (27_491.00, 43_662.00, 0.21),
    (43_662.00, 75_000.00, 0.42),
    (75_000.00, 125_140.00, 0.45),
    (125_140.00, float("inf"), 0.48),
]

NI_PRIMARY_THRESHOLD = 12_570.00
NI_UPPER_EARNINGS_LIMIT = 50_270.00
NI_MAIN_RATE = 0.08
NI_ADDITIONAL_RATE = 0.02

STUDENT_LOAN_PLANS = {
    "plan1": {"threshold": 26_065.00, "rate": 0.09},
    "plan2": {"threshold": 28_470.00, "rate": 0.09},
    "plan4": {"threshold": 32_745.00, "rate": 0.09},
    "plan5": {"threshold": 25_000.00, "rate": 0.09},
}
