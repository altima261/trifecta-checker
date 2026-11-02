export const metadata = {
  title: 'Trifecta Checker - AI Safety Gate',
  description: 'One API call to block Lethal Trifecta data theft',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
