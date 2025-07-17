"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Book {
  id: string
  title: string
  author: string
  isBorrowed: boolean
}

export default function UserDashboard() {
  const [books, setBooks] = useState<Book[]>([
    { id: "1", title: "星の王子さま", author: "アントワーヌ・ド・サン＝テグジュペリ", isBorrowed: false },
    { id: "2", title: "吾輩は猫である", author: "夏目漱石", isBorrowed: true },
    { id: "3", title: "ノルウェイの森", author: "村上春樹", isBorrowed: false },
    { id: "4", title: "銀河鉄道の夜", author: "宮沢賢治", isBorrowed: false },
    { id: "5", title: "こころ", author: "夏目漱石", isBorrowed: true },
  ])

  const handleBorrow = (bookId: string) => {
    setBooks((prevBooks) => prevBooks.map((book) => (book.id === bookId ? { ...book, isBorrowed: true } : book)))
  }

  const handleReturn = (bookId: string) => {
    setBooks((prevBooks) => prevBooks.map((book) => (book.id === bookId ? { ...book, isBorrowed: false } : book)))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">ようこそ、図書館へ！</CardTitle>
            <CardDescription>利用可能な書籍を閲覧し、借りたり返却したりできます。</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>著者</TableHead>
                  <TableHead className="w-[120px]">状況</TableHead>
                  <TableHead className="w-[150px] text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          book.isBorrowed ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {book.isBorrowed ? "貸出中" : "利用可能"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {book.isBorrowed ? (
                        <Button onClick={() => handleReturn(book.id)} variant="outline" className="w-24">
                          返却する
                        </Button>
                      ) : (
                        <Button onClick={() => handleBorrow(book.id)} className="w-24">
                          借りる
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
