import { Poppins } from 'next/font/google'
import Provider from './provider'
import './global.css'


export const metadata = {
  title: 'Ecom Seller',
  description: 'Ecom Seller',
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-slate-900 font-sans antialiased ${poppins.variable}`}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
