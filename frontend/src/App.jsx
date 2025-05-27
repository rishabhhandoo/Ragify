// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import { ChatProvider } from './context/ChatContext'

function App() {
  return (
    <ChatProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </ChatProvider>
  )
}

export default App