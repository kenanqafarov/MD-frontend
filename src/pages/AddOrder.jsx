import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrderForm from "../components/OrderForm";
import BlurLoader from "../components/layout/BlurLoader";
import { usePatient } from "../hooks/usePatients";

const AddOrder = () => {
    const navigate = useNavigate();
    const { id: patientId } = useParams();
    const { data: patient, isLoading, error } = usePatient(patientId);

    const initialData = useMemo(() => {
        if (!patientId || !patient) {
            return undefined;
        }

        return {
            patientId: Number(patient.id || patientId),
            doctorId: patient.doctorId || patient.doctor_id || patient.baseUser || null,
        };
    }, [patient, patientId]);

    if (patientId && error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                Pasiyent məlumatlarını yükləmək mümkün olmadı.
            </div>
        );
    }

    return (
        <BlurLoader isLoading={Boolean(patientId && isLoading)}>
            <div className="w-full h-full flex flex-col">
                <OrderForm
                    initialData={initialData}
                    lockedPatientId={patientId ? Number(patientId) : null}
                    onSubmit={() => navigate("/received-orders")}
                    onCancel={() =>
                        navigate(
                            patientId
                                ? `/patients/patient/${patientId}/general`
                                : "/sent-orders"
                        )
                    }
                />
            </div>
        </BlurLoader>
    );
}

export default AddOrder;
