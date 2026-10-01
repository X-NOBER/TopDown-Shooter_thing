import "./globals.css";

export const metadata = {
  title: "Top-Down Shooter",
  description: "Top-down shooter prototype built with Next.js and p5.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f14] font-sans text-[#e8eef7] antialiased">
        {children}
      </body>
    </html>
  );
}
