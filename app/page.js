import Header from "./components/Header";
import HomePageMain from "./components/HomePageMain";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      
      <Header />
        
      <HomePageMain />
        
      <Footer />

    </div>
  );
}
