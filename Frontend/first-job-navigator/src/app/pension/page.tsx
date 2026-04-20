import { PensionContent } from "@/components/pension-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pension Projection",
}

export default function PensionPage() {
  return <PensionContent/>
}