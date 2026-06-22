import localFont from 'next/font/local'
import './global.css'
import StoreProvider from './StoreProvider'

const noir = localFont({
  src: "../../public/fonts/noir.woff2"
});

export default function RootLayout({ children }: { children: React.ReactNode})
{
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={noir.className}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}