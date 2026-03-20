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
import { PedidoFinalizado } from "./pages/PedidoFinalizado";
// import { Stores } from "./pages/Stores";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route path="/" element={<Home />} />
      {/* <Route path="/single/:theId" element={<Single />} /> */}
      {/* <Route path="/demo" element={<Demo />} /> */}

      <Route path="/register" element={<Authpage />} />
      <Route path="/Login" element={<Authpage />} />
      <Route path="/Howorks" element={<Howorks />} />
      <Route path="/Foriders" element={<Foriders />} />
      <Route path="/Help" element={<Help />} />

      <Route
        path="/Profileuser"
        element={
          <PrivateRoute>
            <Profileuser />
          </PrivateRoute>
        }
      />

      <Route
        path="/driver/profile"
        element={
          <PrivateRoute>
            <ProfileDriver />
          </PrivateRoute>
        }
      />

      <Route
        path="/hacer-pedido"
        element={
          <PrivateRoute>
            <HacerPedido />
          </PrivateRoute>
        }
      />

      <Route
        path="/mis-pedidos"
        element={
          <PrivateRoute>
            <MisPedidos />
          </PrivateRoute>
        }
      />

      <Route
        path="/tracking/:orderId"
        element={
          <PrivateRoute>
            <TrackingPedido />
          </PrivateRoute>
        }
      />
      <Route
        path="/pedido-finalizado/:orderId"
        element={
          <PrivateRoute>
            <PedidoFinalizado />
          </PrivateRoute>
        }
      />

      {/* <Route path="/Stores" element={<Stores />} /> */}
    </Route>
  )
);