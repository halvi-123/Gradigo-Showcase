import type { Metadata } from "next"
import { MoveOutReadinessContent } from "@/components/move-out-readiness-content"

export const metadata: Metadata = {
	title: "Move-Out Readiness",
}

export default function MoveOutReadinessPage() {
	return <MoveOutReadinessContent />
}
