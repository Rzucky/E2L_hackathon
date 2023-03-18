import { Navigate } from 'react-router-dom';

function AuthenticatedPage({children, requiredRoles}) {
   const auth = JSON.parse(localStorage.getItem('loginData'));
   console.log("I'm here")
   console.log(auth)
   if (auth === null) {
      return (
         <Navigate to="/login" />
      )
   }

   if (requiredRoles) {
      const currentRole = JSON.parse(localStorage.getItem('role'));
      console.log("True");
      if (!requiredRoles.includes(currentRole)) {
         return (
            <Navigate to="/" />
         )
      }
   }

   return children;
}

export default AuthenticatedPage;