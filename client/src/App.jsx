import styles from "./App.module.css";
import Header from "./components/Header";
import MainChat from "./components/MainChat";
import AppContext from "./AppContext";
import { useReducer, useCallback } from "react";
import switcher from "./utility/switcher";

const initialState = {
  isLoggedIn: false,
  mainPageSwitch: "home page",
  username: "",
  password: "",
  signupError: "",
  loginError: "",
  status: "🟢 online",
  usersOnline: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "showLoginPage":
      return { ...state, mainPageSwitch: action.payload };
    case "showSignupPage":
      return { ...state, mainPageSwitch: action.payload };
    case "usernameChange":
      return { ...state, username: action.payload };
    case "passwordChange":
      return { ...state, password: action.payload };
    case "signupError":
      return { ...state, signupError: action.payload };
    case "loginError":
      return { ...state, loginError: action.payload };
    case "isLoggedIn":
      return { ...state, isLoggedIn: action.payload };
    case "status":
      return { ...state, status: action.payload };
    case "usersOnline":
      return { ...state, usersOnline: action.payload };
    default:
      throw new Error();
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  //===================USEEFFECT========================

  //=====================HANDLERS======================
  const handleUsersOnline = useCallback((usersOnline) => {
    dispatch({ type: "usersOnline", payload: usersOnline });
  }, []);

  function handleLoginPage() {
    dispatch({ type: "showLoginPage", payload: "login page" });
  }

  function handleSignupPage() {
    dispatch({ type: "showSignupPage", payload: "signup page" });
  }

  function handleLoginChange(e) {
    if (e.target.name === "username") {
      dispatch({ type: "usernameChange", payload: e.target.value });
    } else if (e.target.name === "password") {
      dispatch({ type: "passwordChange", payload: e.target.value });
    }
  }

  function handleSignupChange(e) {
    if (e.target.name === "username") {
      dispatch({ type: "usernameChange", payload: e.target.value });
    } else if (e.target.name === "password") {
      dispatch({ type: "passwordChange", payload: e.target.value });
    }
  }

  async function handleSignup() {
    if (state.username.length < 3) {
      dispatch({
        type: "signupError",
        payload: "username should be more than two characters",
      });
      setTimeout(() => {
        dispatch({ type: "signupError", payload: "" });
      }, 2000);
    } else if (state.password.length < 5) {
      dispatch({
        type: "signupError",
        payload: "password should be more than 4 characters ",
      });
      setTimeout(() => {
        dispatch({ type: "signupError", payload: "" });
      }, 2000);
    } else {
      try {
        const request = await fetch("http://127.0.0.1:3000/signup", {
          method: "POST",
          mode: "cors",
          cache: "default",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          redirect: "follow",
          referrerPolicy: "no-referrer",
          body: JSON.stringify({
            username: state.username,
            password: state.password,
          }),
        });

        const res = await request.json();
        if (res.status === "okay") {
          dispatch({
            type: "isLoggedIn",
            payload: true,
          });
        }
      } catch (e) {
        dispatch({ type: "signupError", payload: "Error while signing up" });
        setTimeout(() => {
          dispatch({ type: "signupError", payload: "" });
        }, 2000);
      }
    }
  }

  async function handleLogin() {
    try {
      const request = await fetch("http://127.0.0.1:3000/login", {
        method: "POST",
        mode: "cors",
        cache: "default",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
          username: state.username,
          password: state.password,
        }),
      });

      const res = await request.json();
      if (res.status === "incorrectUser") {
        dispatch({
          type: "loginError",
          payload: "incorrect username or password",
        });
        setTimeout(() => {
          dispatch({ type: "loginError", payload: "" });
        }, 2000);
      }

      if (res.status === "correct") {
        dispatch({
          type: "isLoggedIn",
          payload: true,
        });
      }
    } catch (e) {
      dispatch({ type: "loginError", payload: "Error while logging in" });
      setTimeout(() => {
        dispatch({ type: "loginError", payload: "" });
      }, 2000);
    }
  }

  //=================UTILITY========================
  const switched = switcher(
    state.mainPageSwitch,
    handleLoginPage,
    handleSignupPage,
    handleLoginChange,
    handleLogin,
    handleUsersOnline,
    handleSignupChange,
    handleSignup
  );
  //==========================================

  return (
    <AppContext.Provider value={state}>
      <div className={styles.App}>
        <Header />
        {state.isLoggedIn ? (
          <MainChat handleUsersOnline={handleUsersOnline} />
        ) : (
          switched
        )}
      </div>
    </AppContext.Provider>
  );
}
