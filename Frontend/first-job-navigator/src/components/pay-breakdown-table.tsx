"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SalaryCalculationResult = {
  grossAnnualSalary: number
  totalDeductions: number
  incomeTax: number
  nationalInsurance: number
  pensionContribution: number
  studentLoanRepayment: number
  netAnnualPay: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value)

export function PayBreakdownTable({ result }: { result: SalaryCalculationResult }) {
  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-semibold text-white">
          Pay Breakdown
        </CardTitle>
        <p className="text-sm text-gray-400">
          Breakdown of gross salary, deductions, and final take-home pay.
        </p>
      </CardHeader>

      <CardContent>
        <Table>
          <TableBody>

            <TableRow>
              <TableCell>Gross Salary</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(result.grossAnnualSalary)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Income Tax</TableCell>
              <TableCell className="text-right text-red-500">
                -{formatCurrency(result.incomeTax)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>National Insurance</TableCell>
              <TableCell className="text-right text-red-500">
                -{formatCurrency(result.nationalInsurance)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Pension</TableCell>
              <TableCell className="text-right text-red-500">
                -{formatCurrency(result.pensionContribution)}
              </TableCell>
            </TableRow>


            <TableRow>
              <TableCell>Student Loan</TableCell>
              <TableCell className="text-right text-red-500">
                -{formatCurrency(result.studentLoanRepayment)}
              </TableCell>
            </TableRow>

            <TableRow>
            <TableCell>Total Deductions</TableCell>
            <TableCell className="text-right text-red-500">
                -{formatCurrency(result.totalDeductions)}
            </TableCell>
            </TableRow>

            <TableRow className="border-t font-semibold">
              <TableCell>Take Home Pay </TableCell>
              <TableCell className="text-right text-green-500">
                {formatCurrency(result.netAnnualPay)}
              </TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}