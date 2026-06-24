import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Notes from './pages/Notes'
import Post from './pages/Post'
import About from './pages/About'
import './App.css'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:slug" element={<Post />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </>
  )
}
