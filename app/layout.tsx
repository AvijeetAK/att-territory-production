import "./globals.css";

export const metadata = {
  title: "AT&T Territory Intelligence Platform | B2B Commercial Footprint",
  description: "Enterprise geospatial B2B telecom sales intelligence and outside-in fiber conversion prospecting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Fraunces, Plus Jakarta Sans, JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Leaflet 1.9.4 CSS for real interactive street & satellite map */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />

        {/* Leaflet 1.9.4 JS */}
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          async={false}
        ></script>
      </head>
      <body className="antialiased min-h-screen bg-[#F3EFE6] text-[#1C1917] font-sans paper-grain-bg selection:bg-[#C84B31] selection:text-[#FAF7F2]">
        {children}
      </body>
    </html>
  );
}
