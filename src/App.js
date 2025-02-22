import Button from "./components/ui/button";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import Layout from './components/layout/Layout';
import Home from './pages/Home/Home'


function App() {
  return (
    <div>
      <h1>홈페이지</h1>
      <Button>기본 버튼</Button>
      <Button variant="outline">아웃라인 버튼</Button>
      <Button variant="destructive">삭제 버튼</Button>
    </div>
    //  <Router>
    //   <Layout>
    //     <Routes>
    //       <Route path="/" element={<Home/>}/>
    //     </Routes>
    //   </Layout>
    //  </Router>
  );
}


export default App;
