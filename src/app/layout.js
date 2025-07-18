import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { InitJobs } from "@/components/init-jobs";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "göster - share your screen, simply",
  description: "a simple screen recording sharing app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} font-mono antialiased`}
      >
        <InitJobs />
        {children}
        <Toaster 
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: '#0a0a0a',
              border: '1px solid #052e16',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
