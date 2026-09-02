import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { BridgeProvider } from "@/components/bridge-provider";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const appName = "CALTA";

export const metadata: Metadata = {
  title: appName,
  description: appName,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen bg-background flex flex-col">
        <BridgeProvider />
        <header className="sticky top-0 z-50 w-full gradient-hero shadow-lg shadow-black/10">
          <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl overflow-hidden shrink-0">
                <Image
                  src="/assets/calta-logo.jpeg"
                  alt={appName}
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-sm">
                  {appName}
                </span>
                <span className="text-[10px] font-medium text-white/70 -mt-0.5 tracking-wide">
                  Геоаналитическая карта ТЛЦ
                </span>
              </div>
            </Link>
            <Badge className="h-6 rounded-full bg-white/20 text-white text-[11px] font-semibold px-3 backdrop-blur-sm ring-1 ring-white/30 shadow-sm hover:bg-white/25 transition-all duration-300">
              v3
            </Badge>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t">
          <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {appName}
          </div>
        </footer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
