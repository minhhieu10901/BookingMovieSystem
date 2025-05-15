import React, { useState } from "react";
import AuthForm from "../Auth/AuthForm";
import { sendAdminAuthRequest } from "../../api-helpers/api-helpers";
import { useDispatch } from "react-redux";
import { adminActions } from "../../store";
import { useNavigate } from "react-router-dom";

const Admin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const onResReceived = (data) => {
        console.log(data);
        if (data && data.id && data.token) {
            dispatch(adminActions.login())
            localStorage.setItem("adminId", data.id)
            localStorage.setItem("adminToken", data.token)
            navigate("/dashboard");
        } else {
            setError(data?.message || "Đăng nhập thất bại");
        }
    }

    const getData = (data) => {
        console.log("Admin", data);
        setError("");
        sendAdminAuthRequest(data.inputs)
            .then(res => {
                if (res && res.id) {
                    onResReceived(res);
                } else {
                    setError(res?.message || "Đăng nhập thất bại");
                }
            })
            .catch((err) => {
                console.log(err);
                setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
            });
    };

    return <div>
        <AuthForm onSubmit={getData} isAdmin={true} errorMessage={error} />
    </div>
}

export default Admin;