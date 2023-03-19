import { Navigate } from "react-router-dom";

function VerificationPage({ children, requiredRoles }) {
  const username = JSON.parse(localStorage.getItem("username"));

  if (username === null) {
    return (
      <>
        <Navigate to="/login" />
      </>
    );
  }

  return children;
}

export default VerificationPage;
