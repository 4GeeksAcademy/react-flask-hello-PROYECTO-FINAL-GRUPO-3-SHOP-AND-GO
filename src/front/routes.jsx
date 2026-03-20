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
import { MisPedidos } from "./pages/MisPedidos";
import { TrackingPedido } from "./pages/TrackingPedido";
import { PrivateRoute } from "./components/PrivateRoute";
import { Stores } from "./pages/Stores";
import { PedidoFinalizado } from "./pages/PedidoFinalizado";
// import { Stores } from "./pages/Stores";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
 
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Authpage />} />
        <Route path="/Login" element={<Authpage />} />
        <Route path="/Howorks" element={<Howorks />} />
        <Route path="/Foriders" element={<Foriders />} />
        <Route path="/Help" element={<Help />} />
        <Route path="/Stores" element={<Stores />} />
 
        {/* Rutas protegidas - solo USUARIO */}
        <Route path="/Profileuser" element={
          <PrivateRoute allowedRoles={["user"]}>
            <Profileuser />
          </PrivateRoute>
        } />
        <Route path="/hacer-pedido" element={
          <PrivateRoute allowedRoles={["user"]}>
            <HacerPedido />
          </PrivateRoute>
        } />
        <Route path="/mis-pedidos" element={
          <PrivateRoute allowedRoles={["user"]}>
            <MisPedidos />
          </PrivateRoute>
        } />
        <Route path="/tracking/:orderId" element={
          <PrivateRoute allowedRoles={["user"]}>
            <TrackingPedido />
          </PrivateRoute>
        } />
 
        {/* Rutas protegidas - solo DRIVER */}      <Route
        path="/pedido-finalizado/:orderId"
        element={
          <PrivateRoute>
            <PedidoFinalizado />
          </PrivateRoute>
        }
      />

        <Route path="/driver/profile" element={
          <PrivateRoute allowedRoles={["driver"]}>
            <ProfileDriver />
          </PrivateRoute>
        } />
 
      </Route>
    )
);
