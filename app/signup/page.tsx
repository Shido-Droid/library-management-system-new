"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
      const trimmedEmail = email.trim()
  if (!trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    alert("有効なメールアドレスを入力してください。")
    return
  }

      if (password.length < 6) {
    alert("パスワードは6文字以上で入力してください。")
    return
  }
  setLoading(true)
  const { data, error } = await supabase.auth.signUp({ email, password })
  setLoading(false)

  if (error) {
    alert("登録に失敗しました: " + error.message)
    console.error("サインアップエラー:", error)
  } else {
    const userId = data.user?.id
    if (userId) {
      const { error: insertError } = await supabase.from("users").insert([
        { id: userId, role: "user" },
      ])
      if (insertError) {
        alert("ユーザー情報の登録に失敗しました: " + insertError.message)
        console.error("usersテーブル挿入エラー:", insertError)
        return
      }
    }
    alert("登録成功！ログインしてください。")
    router.push("/login")
  }
}


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">サインアップ</CardTitle>
          <CardDescription>
            新しいアカウントを作成するためにメールアドレスとパスワードを入力してください
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleSignup} disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
              {loading ? "登録中..." : "サインアップ"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            すでにアカウントをお持ちですか？{" "}
            <Link href="/login" className="w-full">
              ログイン
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
