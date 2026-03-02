import Navbar from './Navbar'
import Footer from './Footer'

/**
 * MainLayout — used for the public landing / marketing pages.
 * Wraps content with the shared Navbar and Footer.
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#E0F7FA] via-[#B2EBF2] to-[#F1F8E9] text-navy font-display antialiased selection:bg-primary/30">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export default MainLayout
