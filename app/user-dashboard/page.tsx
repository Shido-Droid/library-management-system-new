"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Book = {
  id: number
  title: string
  author: string
  available: boolean
}

type Borrowing = {
  id: number
  book_id: number
  book_title: string
  borrowed_at: string
  due_date: string
  returned_at: string | null
}

export default function UserDashboard() {
  const [availableBooks, setAvailableBooks] = useState<Book[]>([])
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // ユーザー取得
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        alert("ログインしてください")
        return
      }
      setUserId(user.id)
    }
    fetchUser()
  }, [])

  // 借用可能本取得（検索対応）
  const fetchAvailableBooks = async () => {
    let query = supabase.from("books").select("*").eq("available", true)
    if (search.trim() !== "") {
      query = query.ilike("title", `%${search}%`)
    }
    const { data, error } = await query
    if (error) {
      alert("借用可能な本の取得に失敗しました: " + error.message)
      return
    }
    setAvailableBooks(data || [])
  }

  // 貸出履歴取得（返却済みも含む）
  const fetchBorrowings = async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from("borrowings")
      .select(`id, book_id, borrowed_at, due_date, returned_at, books(title)`)
      .eq("user_id", userId)
      .order("borrowed_at", { ascending: false })
    if (error) {
      alert("貸出履歴の取得に失敗しました: " + error.message)
      return
    }
    const formatted = data?.map((item: any) => ({
      id: item.id,
      book_id: item.book_id,
      borrowed_at: item.borrowed_at,
      due_date: item.due_date,
      returned_at: item.returned_at,
      book_title: item.books.title,
    })) || []
    setBorrowings(formatted)
  }

  useEffect(() => {
    if (userId) {
      fetchAvailableBooks()
      fetchBorrowings()
    }
  }, [userId])

  useEffect(() => {
    fetchAvailableBooks()
  }, [search])

  // 本を借用する処理
  const handleBorrow = async (bookId: number) => {
    if (!userId) return alert("ログインしてください")
    setLoading(true)

    const borrowedAt = new Date().toISOString()
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    const { error: insertError } = await supabase.from("borrowings").insert([
      {
        user_id: userId,
        book_id: bookId,
        borrowed_at: borrowedAt,
        due_date: dueDate,
        returned_at: null,
      },
    ])
    if (insertError) {
      setLoading(false)
      alert("借用処理に失敗しました: " + insertError.message)
      return
    }

    const { error: updateError } = await supabase
      .from("books")
      .update({ available: false })
      .eq("id", bookId)
    setLoading(false)
    if (updateError) {
      alert("本の状態更新に失敗しました: " + updateError.message)
      return
    }

    alert("借用に成功しました！")
    fetchAvailableBooks()
    fetchBorrowings()
  }

  // 本を返却する処理
  const handleReturn = async (borrowingId: number, bookId: number) => {
    setLoading(true)

    const returnedAt = new Date().toISOString()
    const { error: updateBorrowingError } = await supabase
      .from("borrowings")
      .update({ returned_at: returnedAt })
      .eq("id", borrowingId)
    if (updateBorrowingError) {
      setLoading(false)
      alert("返却処理に失敗しました: " + updateBorrowingError.message)
      return
    }

    const { error: updateBookError } = await supabase
      .from("books")
      .update({ available: true })
      .eq("id", bookId)
    setLoading(false)
    if (updateBookError) {
      alert("本の状態更新に失敗しました: " + updateBookError.message)
      return
    }

    alert("返却に成功しました！")
    fetchAvailableBooks()
    fetchBorrowings()
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">利用者ページ - 本の借用・返却</h1>

      {/* ローディングオーバーレイ */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-lg font-semibold">
            処理中です...
          </div>
        </div>
      )}

      {/* 検索 */}
      <section className="mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="タイトルで検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {/* 借用可能な本一覧 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">借用可能な本一覧</h2>
        {availableBooks.length === 0 ? (
          <p className="text-center text-gray-600">現在借りられる本はありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">タイトル</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">著者</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">借用状態</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {availableBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{book.title}</td>
                    <td className="border border-gray-300 px-4 py-2">{book.author}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-green-600 font-semibold">
                      貸出可能
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => handleBorrow(book.id)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                      >
                        借りる
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 貸出履歴一覧 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">貸出履歴</h2>
        {borrowings.length === 0 ? (
          <p className="text-center text-gray-600">貸出履歴がありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">タイトル</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">借用日</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">返却期限</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">返却日</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((b) => (
                  <tr
                    key={b.id}
                    className={`hover:bg-gray-50 ${
                      b.returned_at ? "bg-gray-50" : "bg-yellow-50"
                    }`}
                  >
                    <td className="border border-gray-300 px-4 py-2">{b.book_title}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {new Date(b.borrowed_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {new Date(b.due_date).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {b.returned_at
                        ? new Date(b.returned_at).toLocaleDateString("ja-JP")
                        : "未返却"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {!b.returned_at && (
                        <button
                          onClick={() => handleReturn(b.id, b.book_id)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                        >
                          返却する
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
