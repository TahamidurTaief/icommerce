// app/layout.js
import { Poppins, Lato, Raleway } from "next/font/google";
import { ThemeProvider } from "@/app/Components/ThemeProvider";
import { AuthProvider } from "@/app/contexts/AuthContext"; // Import AuthProvider
import Navbar from "@/app/Components/Navbar";
import AuthModal from "@/app/Components/Auth/AuthModal"; // Import AuthModal
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata = {
  title: "Issl Commerce",
  description: "Import products from China to Bangladesh",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lato.variable} ${poppins.variable} ${raleway.variable} font-lato w-full`}
        style={{ margin: 0 }}
      >
        {/* FIXED: AuthProvider now wraps everything, making the context available globally. */}
        <AuthProvider>
          <ThemeProvider>
            <div className="bg-[var(--color-background)] min-h-screen">
              <Navbar />
              <main className="w-full">
                <div className="w-full">{children}</div>
              </main>

              {/* AuthModal is rendered here globally but is only visible when triggered */}
              <AuthModal />

              {/* ToastContainer for sitewide notifications */}
              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
