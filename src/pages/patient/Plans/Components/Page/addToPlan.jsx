import { Button, Form, Input, message, Select } from 'antd'
import React, { useEffect } from 'react'
import useInsuranceCompanyStore from '../../../../../../stores/insuranceStore';
import usePlansStore from '../../../../../../stores/plans';

const AddToPlan = ({ onClose, onFinish, editingPlan, patientId }) => {
  const [form] = Form.useForm();


  const {
      insuranceCompanyList,
      fetchList
    } = useInsuranceCompanyStore();

  const {
    createPlans,
    updatePlans,
    loading: plansLoading,
  } = usePlansStore();

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // insuranceCompanyList məlumatını Select options formatına çevir
  const insuranceOptions = [
    { label: 'Yoxdur', value: 0 },
    ...(Array.isArray(insuranceCompanyList) 
      ? insuranceCompanyList.map(insurance => ({
          label: insurance.companyName || `Sığorta #${insurance.id}`,
          value: insurance.id,
        }))
      : [])
  ];

  useEffect(() => {
    if (editingPlan) {
      form.setFieldsValue(editingPlan);
    } else {
      form.resetFields();
    }
  }, [editingPlan, form]);
    
  const handleFinish = async (values) => {
    try {
      // Gender dəyərini API formatına çevir (yetkin -> Yetkin, usaq -> Uşaq)
      const genderValue = values['Gender'] === 'yetkin' ? 'Yetkin' : values['Gender'] === 'usaq' ? 'Uşaq' : values['Gender'];
      
      if (editingPlan) {
        // Plan düzəltmə - yalnız id, planName və key göndərilir
        const updateData = {
          id: editingPlan.id,
          planName: values['Plan Adı'],
          key: genderValue,
        };
        
        const result = await updatePlans(updateData);
        
        // Yalnız uğurlu olduqda (200 status) state yenilə
        if (result.success && result.status === 200) {
          message.success('Plan uğurla yeniləndi!');
          
          // API-dən gələn bütün məlumatı onFinish-ə göndər
          if (onFinish) {
            const apiData = result.data || {};
            const planData = {
              id: apiData.id || editingPlan.id,
              'Plan Adı': apiData.planName || values['Plan Adı'],
              'Sığorta Şirkəti': apiData.insuranceId || apiData.patientInsuranceId || values['Sığorta Şirkəti'],
              'Gender': values['Gender'],
              key: apiData.key,
              isSave: apiData.isSave !== undefined ? apiData.isSave : editingPlan.isSave !== undefined ? editingPlan.isSave : false,
            };
            onFinish(planData);
          }
          
          form.resetFields();
          if (onClose) {
            onClose();
          }
        } else {
          // Xəta olduqda state yeniləmə
          const status = result.status || result.error?.response?.status;
          const errorMessage = result.error?.response?.data?.message || 'Plan yenilənərkən xəta baş verdi';
          message.error(`Xəta (Status: ${status}): ${errorMessage}`);
        }
      } else {
        // Yeni plan əlavə etmə
        const createData = {
          planName: values['Plan Adı'],
          insuranceId: values['Sığorta Şirkəti'] === 0 ? 0 : values['Sığorta Şirkəti'],
          key: genderValue,
          patientId: Number(patientId),
        };
        
        const result = await createPlans(createData);
        
        // Yalnız uğurlu olduqda (200 status) state yenilə
        if (result.success && result.status === 200 || result.status === 201) {
          message.success('Plan uğurla əlavə edildi!');
          
          // API-dən gələn bütün məlumatı onFinish-ə göndər
          if (onFinish) {
            const apiData = result.data || {};
            const planData = {
              id: apiData.id || Date.now(),
              'Plan Adı': apiData.planName || values['Plan Adı'],
              'Sığorta Şirkəti': apiData.insuranceId || apiData.patientInsuranceId || values['Sığorta Şirkəti'],
              'Gender': values['Gender'],
              key: apiData.key || genderValue,
              isSave: apiData.isSave !== undefined ? apiData.isSave : false,
            };
            console.log('API-dən gələn plan data:', apiData); // Debug üçün
            onFinish(planData);
          }
          
          form.resetFields();
          if (onClose) {
            onClose();
          }
        } else {
          // Xəta olduqda state yeniləmə
          const status = result.status || result.error?.response?.status;
          const errorMessage = result.error?.response?.data?.message || 'Plan əlavə edilərkən xəta baş verdi';
          message.error(`Xəta (Status: ${status}): ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Plan əlavə/yeniləmə xətası:', error);
      message.error(error.response?.data?.message || 'Plan əlavə edilərkən xəta baş verdi');
    }
  };
  
  const onFinishFailed = () => {
    message.error('Göndərmə uğursuz oldu!');
  };
    return (
        <div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    name="Plan Adı"
                    label="Plan Adı"
                    rules={[{ required: true, message: 'Plan adı daxil edin' }, { type: 'string', min: 3, message: 'Minimum 3 simvol olmalıdır' }]}
                >
                    <Input placeholder="Plan adını daxil edin" />
                </Form.Item>

                <Form.Item
                    name="Sığorta Şirkəti"
                    label="Sığorta Şirkəti"
                    rules={editingPlan ? [] : [{ required: true, message: 'Sığorta Şirkətini seçin' }]}
                >
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Sığorta şirkətini seçin"
                        options={insuranceOptions}
                        showSearch
                        disabled={!!editingPlan}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>

                <Form.Item
                    name="Gender"
                    label="Seçin"
                    rules={editingPlan ? [] : [{ required: true, message: 'Seçim edin' }]}
                >
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Seçin"
                        disabled={!!editingPlan}
                        options={[
                            { label: 'Yetkin', value: 'yetkin' },
                            { label: 'Uşaq', value: 'usaq' },
                        ]}
                    />

                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit">
                        Təsdiqlə
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default AddToPlan
