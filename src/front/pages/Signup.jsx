import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
 
export const Signup = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
 
    const handleSignUp = async () => {
        if (email === "" || password === "") {
            alert("Please fill in all fields");
            return;
        }
 
        setIsLoading(true);
 
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });
 
            const data = await response.json();
 
            if (response.ok) {
     
                if (data.token) {
                    dispatch({
                        type: "login",
                        payload: {
                            token: data.token,
                            user: data.user
                        }
                    });
                    navigate("/home"); 

                } else {
                    
                    alert("Account created! Please log in.");
                    navigate("/login");
                }
 
                setEmail("");
                setPassword("");
            } else {
                alert("Error: " + (data.msg || "Could not register"));
            }
 
        } catch (error) {
            console.error("Connection error:", error);
            alert("The server is not responding. Check if Flask is running.");
        } finally {
            setIsLoading(false);
        }
    };
 
    return (
        <div>
            <h2>Create Account</h2>

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
 
            <button onClick={handleSignUp} disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
            </button>
 
            <p>
                Already have an account? <Link to="/login">Log in</Link>
            </p>
        </div>
    );
};