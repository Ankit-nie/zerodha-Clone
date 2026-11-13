import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

import Hero from './Hero';
import Awards from './Awards';
import Stats from './Stats';
import Pricing from './Pricing';
import Education from './Education';

import OpenAccount from '../OpenAccount';
import Navbar from '../Navbar';
import Footer from '../Footer';

function HomePage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    useEffect(() => {
        const verifyCookie = async () => {
            try {
                const { data } = await axios.post(
                    "http://localhost:3002",
                    {},
                    { withCredentials: true }
                );
                const { status, user } = data;
                if (status && user) {
                    setUsername(user);
                    toast(`Hello ${user}`, {
                        position: "top-right",
                    });
                }
            } catch (err) {
                console.log(err);
            }
        };
        verifyCookie();
    }, []);

    const Logout = () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUsername("");
        navigate("/login");
    };

    return ( 
        <>
            {username && (
                <div className="container text-end mt-3">
                    <span className="me-3 fw-bold">Welcome, {username}</span>
                    <button onClick={Logout} className="btn btn-outline-danger btn-sm">
                        LOGOUT
                    </button>
                </div>
            )}
            <Hero/>
            <Awards/>
            <Stats/>
            <Pricing/>
            <Education/>
            <OpenAccount/>
            <ToastContainer />
        </>
     );
}

export default HomePage;