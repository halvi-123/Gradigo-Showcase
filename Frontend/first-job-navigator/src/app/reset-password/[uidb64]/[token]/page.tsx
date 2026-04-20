import { AuthPage } from "../../../../components/auth-page"

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ uidb64: string; token: string }>
}) {
  const { uidb64, token } = await params

  return <AuthPage mode="reset-password" resetTokens={{ uidb64, token }} />
}
