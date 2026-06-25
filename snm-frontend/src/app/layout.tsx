import localFont from 'next/font/local'
import './global.css'

const noir = localFont({
  src: "../../public/fonts/noir.woff2"
});

export default function RootLayout({ children }: { children: React.ReactNode})
{
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={noir.className}>
          {children}
      </body>
    </html>
  )
}