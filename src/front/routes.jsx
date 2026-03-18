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
import HacerPedido from "./pages/HacerPedido";
import { ProfileDriver } from "./pages/ProfileDriver";
import { MisPedidos } from "./pages/MisPedidos";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Authpage/>}/>
        <Route path="/Login" element={<Authpage/>}/>
        <Route path="/Howorks" element={<Howorks/>}/>
        <Route path="/Foriders" element={<Foriders/>}/>
        <Route path="/Help" element={<Help/>}/>
        <Route path="/Profileuser" element={<Profileuser/>}/>
        <Route path="/driver/profile" element={<ProfileDriver/>}/>
        <Route path="/hacer-pedido" element={<HacerPedido />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
      </Route>
    )
)