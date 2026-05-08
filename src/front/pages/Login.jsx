import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export const Login = async () => {

    const {store, dispatch} = useGlobalReducer();
    const navigate = useNavigate();

    const {email, setEmail} = useState("");
    const {password, setPassword} = useState("");
    const {isLoading, setIsLoading} = useState("");

    const handleLogin = async () => {
        if (email == "" || password == "") {
             alert("Please fill in all fields");
            return;
        }
        setIsLoading(true);

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({email, password})
    });

    const data = await response.json();

    try {
        if (!response.ok) {
             alert("Error: " + (data.msg || "Bad email or password"));
             return;
        }else {
            dispatch({
                type: "login",
                payload: {
                    token: data.token,
                    user: data.user
                }
            });

            setEmail("");
            setPassword("");
            navigate("/home");
        }
    } catch (error) {
            console.error("Connection error:", error);
            alert("The server is not responding. Check if Flask is running.");
    }finally{ 
        setIsLoading(false);
    }
};

    return (
        <div>
            <h2>Log In</h2>
 
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
 
            <button onClick={handleLogin} disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
            </button>
 
            <p>
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
        </div>
    );

}