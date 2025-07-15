import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage"; // Changed from "../src/pages/HomePage"
import UploadPage from "./pages/UploadPage"; // Changed from "../src/pages/UploadPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:domain" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
