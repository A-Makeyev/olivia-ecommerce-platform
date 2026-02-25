import './global.css'
import Provider from './provider'


export const metadata = {
  title: 'Ecom Seller',
  description: 'Ecom Seller',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
