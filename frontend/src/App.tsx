import { Routes } from "react-router-dom"
import publicRoutes from "./routes/PublicRoutes"
import privateRoutes from "./routes/PrivateRoutes"

function App() {
  return (
    <Routes>
      {publicRoutes}
      {privateRoutes}
    </Routes>
  )
}

export default App
