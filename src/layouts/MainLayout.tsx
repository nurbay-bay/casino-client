import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import s from "./MainLayout.module.scss";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className={s.layout}>
      <Header />
      <main className={s.main}>{children}</main>
      <Footer />
    </div>
  );
}
