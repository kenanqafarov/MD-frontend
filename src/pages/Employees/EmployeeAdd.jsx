import React, { useEffect } from "react";
import TitleUpdater from "../../components/TitleUpdater";
import UserForm from "../../components/UserForm";
import { useCreateWorker } from "../../hooks/useWorkers";
import BeatLoader from 'react-spinners/BeatLoader'; 
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function EmployeeAdd() {
    const navigate = useNavigate();
    const { mutateAsync, isPending } = useCreateWorker();

    const handleSubmit = async (formData) => {
        try {
            await mutateAsync(formData);
            toast.success("Uğurla yaradıldı");
            navigate("/employees");
        } catch (err) {
            const serverMessage = err?.response?.data?.message || err?.response?.data || err?.message;
            console.error("EmployeeAdd submit error:", err);
            if (serverMessage && typeof serverMessage === 'string') {
                toast.error(serverMessage);
            } else {
                toast.error("Xəta baş verdi");
            }
            throw err;
        }
    };

    return (
        <div className="relative">
            <TitleUpdater title={"Add User"} />
            {isPending && (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] bg-white/10 z-10 rounded-lg">
                   <BeatLoader />
                </div>
            )}
            <UserForm mode="create" onSubmit={handleSubmit} />
        </div>
    );
}

export default EmployeeAdd;