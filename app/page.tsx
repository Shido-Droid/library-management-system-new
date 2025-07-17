"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { data,error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      if (error.message.includes("Email not confirmed")) {
      alert("メールアドレスの確認が完了していません。登録したメールのリンクをクリックして認証してください。")
    } else {
      alert("ログイン失敗: " + error.message)
    }
      console.error("Login error:", error)
    } else {
      console.log("Login success:", data)
      router.push("/role-check") // ロール判定ページなどに遷移
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">ログイン</CardTitle>
          <CardDescription>
            アカウントにアクセスするためにメールアドレスとパスワードを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            アカウントをお持ちではありませんか？{" "}
            <Link href="/signup" className="underline text-blue-600 hover:text-blue-800">
              サインアップ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
