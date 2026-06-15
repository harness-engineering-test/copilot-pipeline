import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OrderListPage } from '@/pages'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/" element={<Navigate to="/orders" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
