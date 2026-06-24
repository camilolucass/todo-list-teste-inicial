import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lista de Tarefas",
  description:
    "Aplicacao web de lista de tarefas com agenda, busca, edicao e exportacao para calendario.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
