"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function RoleCheckPage() {
  const router = useRouter()

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      // ログインユーザーを取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (!user || userError) {
        router.push("/login")
        return
      }

      // usersテーブルからroleを取得
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

      if (error || !data) {
        router.push("/login")
      } else if (data.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/user-dashboard")
      }
    }

    checkRoleAndRedirect()
  }, [router])

  return <div className="text-center mt-20 text-xl">ログイン確認中...</div>
}
