// app/layout.js
import Navbar from "@/app/Components/Navbar";
import "./globals.css";
import { Poppins, Lato, Raleway } from "next/font/google";
import { ThemeProvider } from "@/app/Components/ThemeProvider";

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
        <ThemeProvider>
          <Navbar />
          <main className="w-full">
            {/* Ensure no max-width restriction here */}
            <div className="w-full">{children}</div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
