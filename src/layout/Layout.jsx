import { Outlet } from "react-router";
import Header from "../componnents/Header";
import Footer from "../componnents/Footer";

export default function Layout() {
  return (
    <div>
      <Header />
      <main className="pt-18">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
