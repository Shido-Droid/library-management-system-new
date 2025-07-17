"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function RoleCheckPage() {
  const router = useRouter()

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.log("ユーザーなしまたはエラー:", userError)
          router.push("/login")
          return
        }

        console.log("ログインユーザーID:", user.id)

        const { data: userData, error: dbError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()

        if (dbError || !userData) {
          console.log("役割取得エラー:", dbError)
          alert("ユーザーの役割取得に失敗しました")
          router.push("/login")
          return
        }

        console.log("ユーザーの役割:", userData.role)

        if (userData.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/user")
        }
      } catch (error) {
        console.error("予期せぬエラー:", error)
        router.push("/login")
      }
    }

    checkRoleAndRedirect()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>ログイン中です。リダイレクトしています...</p>
    </div>
  )
}
