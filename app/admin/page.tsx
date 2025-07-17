"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Book = {
  id: number
  title: string
  author: string
}

export default function AdminPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // 検索・ソート・ページネーション用状態
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"title" | "author">("title")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [totalCount, setTotalCount] = useState(0)

  // 本一覧取得（検索・ソート・ページネーション対応）
  const fetchBooks = async () => {
    setLoading(true)

    // 総件数取得
    const { count } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true })
      .ilike("title", `%${search}%`)
    setTotalCount(count || 0)

    // ページデータ取得
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .ilike("title", `%${search}%`)
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to)

    setLoading(false)

    if (error) {
      alert("本の取得に失敗しました: " + error.message)
      return
    }

    setBooks(data || [])
  }

  useEffect(() => {
    fetchBooks()
  }, [search, sortBy, sortOrder, page])

  // 追加・編集・削除関数
  const handleAddBook = async () => {
    if (!title || !author) {
      alert("タイトルと著者を入力してください")
      return
    }
    setLoading(true)
    const { error } = await supabase.from("books").insert([{ title, author }])
    setLoading(false)
    if (error) {
      alert("本の追加に失敗しました: " + error.message)
      return
    }
    setTitle("")
    setAuthor("")
    setPage(1)
    fetchBooks()
  }

  const startEdit = (book: Book) => {
    setEditingId(book.id)
    setTitle(book.title)
    setAuthor(book.author)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTitle("")
    setAuthor("")
  }

  const handleUpdateBook = async () => {
    if (!title || !author || editingId === null) {
      alert("タイトルと著者を入力してください")
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from("books")
      .update({ title, author })
      .eq("id", editingId)
    setLoading(false)
    if (error) {
      alert("本の更新に失敗しました: " + error.message)
      return
    }
    cancelEdit()
    fetchBooks()
  }

  const handleDeleteBook = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return
    setLoading(true)
    const { error } = await supabase.from("books").delete().eq("id", id)
    setLoading(false)
    if (error) {
      alert("本の削除に失敗しました: " + error.message)
      return
    }
    fetchBooks()
  }

  // ページ総数計算
  const totalPages = Math.ceil(totalCount / pageSize)

  // ソート方向切替
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">管理者ページ - 本の管理</h1>

      {/* 検索 */}
      <div className="mb-6 flex items-center space-x-3">
        <Input
          placeholder="タイトルで検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow max-w-md"
        />
        <Button
          onClick={() => setPage(1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
        >
          検索
        </Button>
      </div>

      {/* ソート */}
      <div className="mb-6 flex items-center space-x-3 justify-center">
        <span className="font-medium">ソート:</span>
        <Button
          onClick={() => setSortBy("title")}
          className={`px-4 py-1 rounded ${
            sortBy === "title" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          タイトル
        </Button>
        <Button
          onClick={() => setSortBy("author")}
          className={`px-4 py-1 rounded ${
            sortBy === "author" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          著者
        </Button>
        <Button
          onClick={toggleSortOrder}
          className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
        >
          {sortOrder === "asc" ? "昇順 ↑" : "降順 ↓"}
        </Button>
      </div>

      {/* 追加・編集フォーム */}
      <div className="mb-8 max-w-lg mx-auto bg-gray-50 p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">{editingId ? "本の編集" : "本の追加"}</h2>
        <Input
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="著者"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-center space-x-4">
          {editingId ? (
            <>
              <Button
                onClick={handleUpdateBook}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6"
                disabled={loading}
              >
                保存
              </Button>
              <Button
                variant="ghost"
                onClick={cancelEdit}
                className="bg-gray-300 hover:bg-gray-400 text-black px-6"
              >
                キャンセル
              </Button>
            </>
          ) : (
            <Button
              onClick={handleAddBook}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
              disabled={loading}
            >
              追加
            </Button>
          )}
        </div>
      </div>

      {/* 本一覧 */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">本の一覧</h2>
        {loading ? (
          <p className="text-center">読み込み中...</p>
        ) : books.length === 0 ? (
          <p className="text-center text-gray-600">本が登録されていません。</p>
        ) : (
          <ul>
            {books.map((book) => (
              <li
                key={book.id}
                className="flex justify-between items-center border-b border-gray-300 py-3"
              >
                <div className="text-lg font-medium">
                  {book.title} <span className="text-gray-500">/ {book.author}</span>
                </div>
                <div className="space-x-3">
                  <Button
                    size="sm"
                    onClick={() => startEdit(book)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                  >
                    編集
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteBook(book.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3"
                  >
                    削除
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ページネーション */}
      <div className="mt-8 flex justify-center space-x-4">
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="bg-gray-300 hover:bg-gray-400 px-6"
        >
          前へ
        </Button>
        <span className="px-4 py-1 border rounded text-lg font-semibold">
          {page} / {totalPages}
        </span>
        <Button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="bg-gray-300 hover:bg-gray-400 px-6"
        >
          次へ
        </Button>
      </div>
    </div>
  )
}
