// import React, { createContext, useEffect, useState } from "react";

// export const AppContext = createContext();

// const UserContextProvider = (props) => {
//   const [token, setToken] = useState("");

//   const value = { token, setToken };

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     setToken(storedToken);
//   }, []);

//   return (
//     <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
//   );
// };

// export default UserContextProvider;

import React, { createContext, useEffect, useState } from "react";

export const AppContext = createContext();

const UserContextProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");

    if (storedToken) setToken(storedToken);
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  // Keep token in sync
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Keep user in sync
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  return (
    <AppContext.Provider
      value={{
        token,
        setToken,
        currentUser,
        setCurrentUser,
        pdfUrl,
        setPdfUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default UserContextProvider;
