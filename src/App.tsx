import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import MainLayout from "./layouts/MainLayout";
import HistoryPage from "./pages/HistoryPage";
import CasinoPage from "./pages/CasinoPage";


function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/casino" element={<CasinoPage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
