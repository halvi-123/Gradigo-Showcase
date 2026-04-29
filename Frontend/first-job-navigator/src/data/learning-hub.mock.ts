import type { Article, Video, Quiz, LearningDashboard } from "@/lib/learning-hub/types"

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "Understanding Your Payslip",
    slug: "understanding-your-payslip",
    content: "",
    external_url: "https://www.gov.uk/understanding-your-pay",
  },
  {
    id: 2,
    title: "How Income Tax Works in the UK",
    slug: "how-income-tax-works",
    content: "",
    external_url: "https://www.gov.uk/income-tax",
  },
  {
    id: 3,
    title: "National Insurance Explained",
    slug: "national-insurance-explained",
    content: "",
    external_url: "https://www.gov.uk/national-insurance",
  },
  {
    id: 4,
    title: "How to Start Saving Money",
    slug: "how-to-start-saving",
    content: "",
    external_url: "https://www.moneyhelper.org.uk/en/savings",
  },
  {
    id: 5,
    title: "Beginner's Guide to Pensions",
    slug: "beginners-guide-to-pensions",
    content: "",
    external_url: "https://www.moneyhelper.org.uk/en/pensions-and-retirement",
  },
  {
    id: 6,
    title: "Student Loan Repayments Explained",
    slug: "student-loan-repayments",
    content: "",
    external_url: "https://www.gov.uk/repaying-your-student-loan",
  },
  {
    id: 7,
    title: "How to Build an Emergency Fund",
    slug: "emergency-fund",
    content: "",
    external_url: "https://www.moneyhelper.org.uk/en/savings/types-of-savings/emergency-savings-how-much-is-enough",
  },
  {
    id: 8,
    title: "Understanding Your Tax Code",
    slug: "understanding-tax-code",
    content: "",
    external_url: "https://www.gov.uk/tax-codes",
  },
  {
    id: 9,
    title: "What is Auto-Enrolment?",
    slug: "auto-enrolment",
    content: "",
    external_url: "https://www.moneyhelper.org.uk/en/pensions-and-retirement/auto-enrolment",
  },
  {
    id: 10,
    title: "Renting for the First Time",
    slug: "renting-first-time",
    content: "",
    external_url: "https://www.gov.uk/private-renting",
  },
  {
    id: 11,
    title: "How to Read a Job Offer",
    slug: "how-to-read-job-offer",
    content: "",
    external_url: "https://www.gov.uk/employment-contracts-and-conditions",
  },
  {
    id: 12,
    title: "The 50/30/20 Budgeting Rule",
    slug: "50-30-20-rule",
    content: "",
    external_url: "https://www.moneyhelper.org.uk/en/everyday-money/budgeting",
  },
]

export const MOCK_VIDEOS: Video[] = [
  {
    id: 1,
    title: "How Pensions Work",
    youtube_url: "https://www.youtube.com/watch?v=1YkGQfkiJmo",
    description: "A beginner's guide to understanding pensions",
  },
  {
    id: 2,
    title: "UK Tax System Explained",
    youtube_url: "https://www.youtube.com/watch?v=AwSzAL4EyTs",
    description: "Everything you need to know about UK taxes",
  },
  {
    id: 3,
    title: "Budgeting for Beginners",
    youtube_url: "https://www.youtube.com/watch?v=sVKQn2I4HDM",
    description: "How to create and stick to a budget",
  },
  {
    id: 4,
    title: "Understanding National Insurance",
    youtube_url: "https://www.youtube.com/watch?v=GJeZMRCCjpA",
    description: "What is NI and why do you pay it",
  },
  {
    id: 5,
    title: "How to Save Money on a Low Income",
    youtube_url: "https://www.youtube.com/watch?v=7PwNFhPZdN8",
    description: "Practical tips for saving when money is tight",
  },
  {
    id: 6,
    title: "Student Loans Explained",
    youtube_url: "https://www.youtube.com/watch?v=sh5KMnxFQFk",
    description: "Everything you need to know about student loan repayments",
  },
  {
    id: 7,
    title: "First Job Financial Tips",
    youtube_url: "https://www.youtube.com/watch?v=HQzoZfc3GwQ",
    description: "Essential money tips for your first job",
  },
  {
    id: 8,
    title: "How to Invest as a Beginner",
    youtube_url: "https://www.youtube.com/watch?v=gFQNPmLKj1k",
    description: "A simple introduction to investing your money",
  },
  {
    id: 9,
    title: "Understanding Your Payslip",
    youtube_url: "https://www.youtube.com/watch?v=bxWdPSLVoaU",
    description: "How to read and understand your payslip",
  },
  {
    id: 10,
    title: "Emergency Fund Explained",
    youtube_url: "https://www.youtube.com/watch?v=vftjBTjFlzI",
    description: "Why you need an emergency fund and how to build one",
  },
]

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 1,
    title: "Budgeting Basics",
    difficulty: "easy",
    questions: [
      {
        id: 1,
        text: "What is a budget?",
        answers: [
          { id: 1, text: "A plan for managing your money" },
          { id: 2, text: "A type of bank account" },
          { id: 3, text: "A government tax" },
          { id: 4, text: "A type of loan" },
        ],
      },
      {
        id: 2,
        text: "What does net pay mean?",
        answers: [
          { id: 5, text: "Your salary before deductions" },
          { id: 6, text: "Your salary after deductions" },
          { id: 7, text: "Your pension contributions" },
          { id: 8, text: "Your tax code" },
        ],
      },
      {
        id: 3,
        text: "What is gross pay?",
        answers: [
          { id: 9, text: "Your salary before any deductions" },
          { id: 10, text: "Your salary after tax" },
          { id: 11, text: "Your monthly expenses" },
          { id: 12, text: "Your pension pot" },
        ],
      },
      {
        id: 4,
        text: "Which of these is a fixed expense?",
        answers: [
          { id: 13, text: "Rent" },
          { id: 14, text: "Eating out" },
          { id: 15, text: "Cinema tickets" },
          { id: 16, text: "Clothing" },
        ],
      },
      {
        id: 5,
        text: "What is the 50/30/20 rule?",
        answers: [
          { id: 17, text: "50% needs, 30% wants, 20% savings" },
          { id: 18, text: "50% savings, 30% needs, 20% wants" },
          { id: 19, text: "50% wants, 30% savings, 20% needs" },
          { id: 20, text: "50% tax, 30% rent, 20% food" },
        ],
      },
      {
        id: 6,
        text: "What is an emergency fund?",
        answers: [
          { id: 21, text: "Money saved for unexpected expenses" },
          { id: 22, text: "A government grant" },
          { id: 23, text: "A type of pension" },
          { id: 24, text: "A credit card limit" },
        ],
      },
      {
        id: 7,
        text: "How many months of expenses is typically recommended for an emergency fund?",
        answers: [
          { id: 25, text: "3 to 6 months" },
          { id: 26, text: "1 month" },
          { id: 27, text: "12 months" },
          { id: 28, text: "2 weeks" },
        ],
      },
      {
        id: 8,
        text: "What is a direct debit?",
        answers: [
          { id: 29, text: "An automatic payment from your bank account" },
          { id: 30, text: "A type of savings account" },
          { id: 31, text: "A cash withdrawal" },
          { id: 32, text: "A government payment" },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "UK Tax Knowledge",
    difficulty: "medium",
    questions: [
      {
        id: 9,
        text: "What is the standard personal allowance in the UK?",
        answers: [
          { id: 33, text: "£12,570" },
          { id: 34, text: "£10,000" },
          { id: 35, text: "£15,000" },
          { id: 36, text: "£20,000" },
        ],
      },
      {
        id: 10,
        text: "What is the basic rate of income tax in the UK?",
        answers: [
          { id: 37, text: "20%" },
          { id: 38, text: "15%" },
          { id: 39, text: "25%" },
          { id: 40, text: "40%" },
        ],
      },
      {
        id: 11,
        text: "At what income does the higher rate of income tax start?",
        answers: [
          { id: 41, text: "£50,270" },
          { id: 42, text: "£40,000" },
          { id: 43, text: "£60,000" },
          { id: 44, text: "£45,000" },
        ],
      },
      {
        id: 12,
        text: "What does NI stand for?",
        answers: [
          { id: 45, text: "National Insurance" },
          { id: 46, text: "Net Income" },
          { id: 47, text: "Non-taxable Income" },
          { id: 48, text: "New Investment" },
        ],
      },
      {
        id: 13,
        text: "What is a tax code used for?",
        answers: [
          { id: 49, text: "To calculate how much tax to deduct from your pay" },
          { id: 50, text: "To identify your bank account" },
          { id: 51, text: "To apply for a student loan" },
          { id: 52, text: "To set up a pension" },
        ],
      },
      {
        id: 14,
        text: "Which government body collects income tax in the UK?",
        answers: [
          { id: 53, text: "HMRC" },
          { id: 54, text: "The Bank of England" },
          { id: 55, text: "The Treasury" },
          { id: 56, text: "Companies House" },
        ],
      },
      {
        id: 15,
        text: "What is the tax year end date in the UK?",
        answers: [
          { id: 57, text: "5th April" },
          { id: 58, text: "31st December" },
          { id: 59, text: "31st March" },
          { id: 60, text: "1st January" },
        ],
      },
      {
        id: 16,
        text: "What is a P60?",
        answers: [
          { id: 61, text: "A summary of your pay and tax for the year" },
          { id: 62, text: "A form to claim a tax refund" },
          { id: 63, text: "A pension statement" },
          { id: 64, text: "A student loan document" },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Pension Planning",
    difficulty: "hard",
    questions: [
      {
        id: 17,
        text: "What is the minimum auto-enrolment pension contribution for employees?",
        answers: [
          { id: 65, text: "5%" },
          { id: 66, text: "3%" },
          { id: 67, text: "8%" },
          { id: 68, text: "10%" },
        ],
      },
      {
        id: 18,
        text: "What is the minimum employer pension contribution under auto-enrolment?",
        answers: [
          { id: 69, text: "3%" },
          { id: 70, text: "5%" },
          { id: 71, text: "1%" },
          { id: 72, text: "8%" },
        ],
      },
      {
        id: 19,
        text: "At what age can you currently access your private pension in the UK?",
        answers: [
          { id: 73, text: "55" },
          { id: 74, text: "60" },
          { id: 75, text: "65" },
          { id: 76, text: "67" },
        ],
      },
      {
        id: 20,
        text: "What is a defined contribution pension?",
        answers: [
          { id: 77, text: "A pension where the amount saved determines your retirement income" },
          { id: 78, text: "A pension with a guaranteed fixed income" },
          { id: 79, text: "A government pension paid to all citizens" },
          { id: 80, text: "A pension only available to civil servants" },
        ],
      },
      {
        id: 21,
        text: "What is compound interest in the context of pensions?",
        answers: [
          { id: 81, text: "Earning interest on your interest over time" },
          { id: 82, text: "A fixed interest rate set by the government" },
          { id: 83, text: "Interest paid only on your original contribution" },
          { id: 84, text: "A fee charged by pension providers" },
        ],
      },
      {
        id: 22,
        text: "What does inflation do to the real value of your pension pot over time?",
        answers: [
          { id: 85, text: "Reduces its purchasing power" },
          { id: 86, text: "Increases its value" },
          { id: 87, text: "Has no effect" },
          { id: 88, text: "Doubles it every 10 years" },
        ],
      },
      {
        id: 23,
        text: "What is the State Pension age for people born after 1978?",
        answers: [
          { id: 89, text: "67" },
          { id: 90, text: "65" },
          { id: 91, text: "60" },
          { id: 92, text: "70" },
        ],
      },
      {
        id: 24,
        text: "How many qualifying years of National Insurance do you need for the full State Pension?",
        answers: [
          { id: 93, text: "35 years" },
          { id: 94, text: "25 years" },
          { id: 95, text: "40 years" },
          { id: 96, text: "30 years" },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Renting and Moving Out",
    difficulty: "medium",
    questions: [
      {
        id: 25,
        text: "What is a tenancy deposit typically capped at in England?",
        answers: [
          { id: 97, text: "5 weeks rent" },
          { id: 98, text: "2 months rent" },
          { id: 99, text: "1 month rent" },
          { id: 100, text: "3 months rent" },
        ],
      },
      {
        id: 26,
        text: "What is a guarantor?",
        answers: [
          { id: 101, text: "Someone who agrees to pay rent if you cannot" },
          { id: 102, text: "Your landlord's representative" },
          { id: 103, text: "A type of tenancy agreement" },
          { id: 104, text: "An insurance policy for renters" },
        ],
      },
      {
        id: 27,
        text: "What does an AST stand for in renting?",
        answers: [
          { id: 105, text: "Assured Shorthold Tenancy" },
          { id: 106, text: "Annual Savings Target" },
          { id: 107, text: "Agreed Short Term" },
          { id: 108, text: "Assessed Standard Tenancy" },
        ],
      },
      {
        id: 28,
        text: "Who is responsible for repairs to the structure of a rented property?",
        answers: [
          { id: 109, text: "The landlord" },
          { id: 110, text: "The tenant" },
          { id: 111, text: "The letting agent" },
          { id: 112, text: "The local council" },
        ],
      },
      {
        id: 29,
        text: "What is council tax?",
        answers: [
          { id: 113, text: "A local tax paid by residents to fund local services" },
          { id: 114, text: "A tax on property purchases" },
          { id: 115, text: "A charge for using local roads" },
          { id: 116, text: "A national government tax" },
        ],
      },
      {
        id: 30,
        text: "What is a standing order?",
        answers: [
          { id: 117, text: "A regular fixed payment you set up from your bank" },
          { id: 118, text: "An instruction from your landlord" },
          { id: 119, text: "A type of tenancy agreement" },
          { id: 120, text: "A court order for unpaid rent" },
        ],
      },
      {
        id: 31,
        text: "What is contents insurance?",
        answers: [
          { id: 121, text: "Insurance that covers your belongings in a rented property" },
          { id: 122, text: "Insurance for the building structure" },
          { id: 123, text: "Insurance for the landlord's furniture" },
          { id: 124, text: "A type of life insurance" },
        ],
      },
      {
        id: 32,
        text: "How much notice must a landlord typically give before entering the property?",
        answers: [
          { id: 125, text: "24 hours" },
          { id: 126, text: "48 hours" },
          { id: 127, text: "1 week" },
          { id: 128, text: "No notice required" },
        ],
      },
    ],
  },
]

export const MOCK_DASHBOARD: LearningDashboard = {
  completed_articles: 0,
  total_articles: 12,
  quizzes_taken: 0,
  average_score: 0,
}