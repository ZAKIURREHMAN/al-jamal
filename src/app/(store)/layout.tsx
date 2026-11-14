import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { Toaster } from "@/components/ui/toast";
import { CartDrawer } from "@/components/store/cart-drawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <Toaster />
    </>
  );
}
