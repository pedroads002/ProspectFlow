import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 text-center">
      <Logo />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/">Voltar ao início</Link>} />
    </div>
  );
}
