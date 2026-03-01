// app/layout.js
export const metadata = {
  title: "D1 Baseball – Power 4 Live Scores",
  description: "Live college baseball scores, box scores, and stats for SEC, ACC, Big 12, and Big Ten.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700;800&family=Lato:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #f4f5f7; font-family: 'Oswald', sans-serif; }
          @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          @keyframes spin { to{transform:rotate(360deg)} }
          ::-webkit-scrollbar{width:5px;height:5px}
          ::-webkit-scrollbar-track{background:#f0f0f0}
          ::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
