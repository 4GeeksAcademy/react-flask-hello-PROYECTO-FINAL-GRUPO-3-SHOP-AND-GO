import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Authpage } from "./pages/Authpage";
import { Howorks } from "./pages/Howorks";
import { Foriders } from "./pages/Foriders";
import { Help } from "./pages/Help";
import { Profileuser } from "./pages/Profileuser";
import { ProfileDriver } from "./pages/ProfileDriver";
import HacerPedido from "./pages/HacerPedido";
import { Stores } from "./pages/Stores";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

        {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
        <Route path= "/" element={<Home />} />
        {/* <Route path="/single/:theId" element={ <Single />} />  Dynamic route for single items */}
        {/* <Route path="/demo" element={<Demo />} /> */}
        <Route path="/register" element={<Authpage/>}/> {/* //Register */}
        <Route path="/Login" element={<Authpage/>}/> {/* //Login */}
        <Route path="/Howorks" element={<Howorks/>}/> {/* Cómo funciona*/}
        <Route path="/Foriders" element={<Foriders/>}/> {/* Para riders*/}
        <Route path="/Help" element={<Help/>}/> {/* Ayuda*/}
        <Route path="/Profileuser" element={<Profileuser/>}/> {/* Perfil usuario*/}
        <Route path="/driver/profile" element={<ProfileDriver/>}/> {/* URGENTE CAMBIAR RUTA*/}
        <Route path="/hacer-pedido" element={<HacerPedido />} />
        <Route path="/Stores" element={<Stores/>}/> {/* TIENDAS*/}
      </Route>
    )
)