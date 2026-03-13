export const initialStore = () => {
  return {
    // ✅ token se inicializa desde sessionStorage para que no se pierda al recargar
    token: sessionStorage.getItem("token") || null,
    user: null,
  }
}

export default function storeReducer(store, action = {}) {
  switch (action.type) {

    // ✅ guarda el token y el usuario al hacer login
    case 'login':
      sessionStorage.setItem("token", action.payload.token);
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user
      };

    // ✅ limpia el token y el usuario al cerrar sesión
    case 'logout':
      sessionStorage.removeItem("token");
      return {
        ...store,
        token: null,
        user: null
      };

    // ✅ actualiza los datos del usuario sin cambiar el token
    case 'set_user':
      return {
        ...store,
        user: action.payload
      };

    default:
      throw Error('Unknown action: ' + action.type);
  }
}