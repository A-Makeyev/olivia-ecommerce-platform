import { Poppins, Roboto } from 'next/font/google'
import Header from '../shared/widgets/header'
import Provider from './provider'
import './global.css'


export const metadata = {
  title: 'Ecom',
  description: 'Ecommerce Platform',
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${roboto.variable}`}>
        <Provider>
          <Header />
          { children }
        </Provider>
      </body>
    </html>
  )
}
