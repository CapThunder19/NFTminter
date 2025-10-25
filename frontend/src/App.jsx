import './App.css'
import Navbar from "./components/Navbar.jsx"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config.js'
import Home from './components/Home.jsx'
import TicketPage from './components/TicketPage.jsx'

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <BrowserRouter>
          <div className="min-h-screen bg-[#050505]">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tickets" element={<TicketPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </QueryClientProvider> 
    </WagmiProvider>
  )
}

export default App;