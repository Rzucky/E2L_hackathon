import { Navigate } from "react-router-dom";

function AuthenticatedPage({ children, requiredRoles }) {
  const auth = JSON.parse(localStorage.getItem("token"));
  console.log(auth);
  if (auth === null) {
    return (
      <>
        <Navigate to="/login" />
      </>
    );
  }

  if (requiredRoles) {
    const currentRole = JSON.parse(localStorage.getItem("role"));
    if (!requiredRoles.includes(currentRole)) {
      return (
        <>
          <Navigate to="/" />
        </>
      );
    }
  }

  return children;
}

export default AuthenticatedPage;
