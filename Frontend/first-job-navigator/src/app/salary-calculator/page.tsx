import { SalaryCalculatorContent } from "@/components/salary-calculator-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Salary Calculator",
}

export default function SalaryCalculatorPage() {
  return <SalaryCalculatorContent />
}