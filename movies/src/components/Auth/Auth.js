import React, { useState } from 'react'
import AuthForm from './AuthForm'
import { sendUserAuthRequest } from '../../api-helpers/api-helpers';
import { userActions } from '../../store';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState("");

    const onResReceived = (data) => {
        console.log(data);
        if (data && data.success && data.user && data.user.id) {
            dispatch(userActions.login())
            localStorage.setItem("userId", data.user.id)
            navigate("/");
        } else {
            setError(data?.message || "Đăng nhập thất bại");
        }
    }

    const getData = (data) => {
        console.log(data);
        setError("");
        sendUserAuthRequest(data.inputs, data.signup)
            .then(res => {
                if (res && res.success) {
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
        <AuthForm onSubmit={getData} isAdmin={false} errorMessage={error} />
    </div>
}

export default Auth