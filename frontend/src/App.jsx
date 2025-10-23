
import './App.css'
import Navbar from "./components/Navbar.jsx"



import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config.js';
import Home from './components/Home.jsx';


const queryClient = new QueryClient()

function App() {
 
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <Navbar />
        <Home />
      </QueryClientProvider> 
    </WagmiProvider>
  )
}

export default App;