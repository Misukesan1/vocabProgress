import { Outlet } from "react-router";
import Header from "../componnents/Header";
import Footer from "../componnents/Footer";
import AlertContent from "../componnents/AlertContent";
import { useDispatch, useSelector } from "react-redux";
import { hideAlert } from "../features/alertSlice";
import { useEffect } from "react";

export default function Layout() {

  const alert = useSelector((state) => state.alert)
  const dispatch = useDispatch()

  useEffect(() => {
    if (alert.isVisible) {
        const timer = setTimeout(() => dispatch(hideAlert()), 3000)
        return () => clearTimeout(timer)
    }
}, [alert.isVisible])

  return (
    <div>
      <Header />
      <main className="pt-18">
        <AlertContent message={alert.message} style={alert.type} isVisible={alert.isVisible}/>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
