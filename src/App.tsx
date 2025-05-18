import { Routes, Route} from "react-router-dom";
import Layout from "./components/Layout";
import NewsSocketClient from "./pages/newsfeed";
import "./App.css"

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route index element={<NewsSocketClient />} />
        </Route>
      </Routes>
    </div>
  );
};