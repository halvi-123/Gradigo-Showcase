"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import {
  BookOpenIcon,
  BriefcaseBusinessIcon,
  CompassIcon,
  PiggyBankIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "lucide-react"
import { TbNavigationDollar } from "react-icons/tb"
import { useAuthSessionState } from "@/hooks/use-auth-session-state"

const featureLinks = [
  { label: "Salary Calculator", href: "/salary-calculator", icon: WalletIcon },
  { label: "Budget Planner", href: "/budget-planner", icon: BriefcaseBusinessIcon },
  { label: "Pension", href: "/pension", icon: PiggyBankIcon },
  { label: "Learning Hub", href: "/learning-hub", icon: BookOpenIcon },
  { label: "Ready to Move Out?", href: "/move-out-readiness", icon: CompassIcon },
  { label: "Profile & Progress", href: "/profile-progress", icon: ShieldCheckIcon },
]

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { isAuthenticated, user, logoutUser } = useAuthSessionState()

  return (
    <Sidebar collapsible="offcanvas" {...props} className="text-sidebar-foreground">
      <SidebarHeader className="px-5 pt-8 pb-6 group-data-[collapsible=icon]:px-2">
        <div className="flex flex-col items-center gap-4 text-center group-data-[collapsible=icon]:gap-0">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-sidebar-primary shadow-sm text-sidebar-primary-foreground">
            <TbNavigationDollar className="size-8" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-heading text-3xl leading-none font-semibold tracking-tight text-sidebar-foreground">
              First Job
            </p>
            <p className="mt-1 font-heading text-3xl leading-none font-semibold tracking-tight text-sidebar-foreground">
              Navigator
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pb-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {featureLinks.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-11 rounded-xl px-3 text-sm font-medium text-sidebar-foreground hover:text-sidebar-accent-foreground"
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="text-sidebar-foreground">
        <NavUser
          user={
            isAuthenticated && user
              ? user
              : {
                  name: "You're not logged in!",
                  email: "Create an account/login to use features.",
                }
          }
          isAuthenticated={isAuthenticated}
          onLogout={logoutUser}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
