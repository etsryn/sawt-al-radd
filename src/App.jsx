import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages Import
import Landing from './components/landing_page/landing'
import BookmarksPage from './components/bookmark_page/bookmark_page';
import KnowYourDeen from './components/know_your_deen_page/know_your_deen'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/know-your-deen" element={<KnowYourDeen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
