import './globals.css'

export const metadata = {
  title: 'Expired Domain Rebuilder',
  description: 'Analyze expired domains for SEO rebuild potential'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="text-center py-4 text-sm text-gray-500">
          Licensed under MIT, by Ahmed Shili | <a href="https://ashili.pages.dev" target="_blank" rel="noopener noreferrer">ashili.pages.dev</a>
        </footer>
      </body>
    </html>
  )
}
