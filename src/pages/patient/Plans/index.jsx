import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom';
import "@ant-design/v5-patch-for-react-19"; // React 19 uyumluluğu için gerekli
import 'antd/dist/reset.css';
import { Select, Space, Divider, Card, Button, Form, message, Modal, Popconfirm, Drawer, Spin } from 'antd';
import {  SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined, LoadingOutlined } from '@ant-design/icons';
import Svg from './Components/Teths/svg';
import DualSelectTable from './Components/Page/dualSelectTable';
import AddToPlan from './Components/Page/addToPlan';
import PlansTable from './Components/Page/plansTable';
import usePatientInsuranceStore from '../../../../stores/patientInsuranceStore';
import usePlansStore from '../../../../stores/plans';
import usePatientPlansControllerStore from '../../../../stores/patient-plans-controller'; 

// LocalStorage helpers for draft plans
const getDraftPlans = (patientId) => {
  try {
    return JSON.parse(localStorage.getItem(`MD_DRAFT_PLANS_${patientId}`) || '[]');
  } catch {
    return [];
  }
};

const setDraftPlans = (patientId, drafts) => {
  localStorage.setItem(`MD_DRAFT_PLANS_${patientId}`, JSON.stringify(drafts));
};

const addDraftPlan = (patientId, plan) => {
  const drafts = getDraftPlans(patientId);
  if (!drafts.some(p => p.id === plan.id)) {
    setDraftPlans(patientId, [...drafts, plan]);
  }
};

const removeDraftPlan = (patientId, planId) => {
  const drafts = getDraftPlans(patientId);
  setDraftPlans(patientId, drafts.filter(p => p.id !== planId));
};
const Plans = () => {     
  const { id: patientId } = useParams();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedOperationCode, setSelectedOperationCode] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedOperationId, setSelectedOperationId] = useState(null);
  const [selectedToothData, setSelectedToothData] = useState(null);
  const [resetToothSelection, setResetToothSelection] = useState(false);
  const [resetDrawerSelection, setResetDrawerSelection] = useState(false);
  const [patientPlansData, setPatientPlansData] = useState([]);
  const [loadingPatientPlans, setLoadingPatientPlans] = useState(false);
  const [sendingPlan, setSendingPlan] = useState(false);
  const [confirmingPlan, setConfirmingPlan] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);
  const [deletingPlanItem, setDeletingPlanItem] = useState(false);
  const prevOperationRef = useRef({ operationId: null, operationCode: null }); // Əvvəlki əməliyyat dəyərlərini izlə
  const isClearingToothRef = useRef(false); // Diş seçimini təmizlədiyimizi izlə

  const {
    patientInsurance,
    fetchPatientInsurance,
    loading: insuranceLoading,
  } = usePatientInsuranceStore();

  const {
    fetchPlans: fetchPlansFromStore,
    deletePlans: deletePlansFromStore,
    loading: plansLoading,
  } = usePlansStore();

  const {
    createPatientPlan: createPatientPlanFromStore,
    readPatientPlans: readPatientPlansFromStore,
    deletePatientPlanItem: deletePatientPlanItemFromStore,
    savePatientPlan: savePatientPlanFromStore,
    selectedCategoryAndOperationItems,
    patientPlansData: storePatientPlansData,
  } = usePatientPlansControllerStore();

  const showModal = (plan = null) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handlePlanAdd = async (planData) => {
    // Gender-i key-ə çevir (API-dən gələn key varsa onu istifadə et)
    const planKey = planData.key || (planData['Gender'] === 'yetkin' ? 'Yetkin' : planData['Gender'] === 'usaq' ? 'Uşaq' : planData['Gender']);
    
    console.log('handlePlanAdd - planData:', planData); // Debug üçün
    
    if (editingPlan) {
      // Plan düzenleme - API çağrısı addToPlan içinde yapıldı, API-dən gələn datanı istifadə et
      const isSaveVal = planData.isSave !== undefined ? planData.isSave : (editingPlan.isSave !== undefined ? editingPlan.isSave : false);
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id 
          ? { 
              ...plan, 
              ...planData, 
              key: planKey,
              isSave: isSaveVal
            }
          : plan
      ));
      
      const drafts = getDraftPlans(patientId);
      if (drafts.some(p => p.id === editingPlan.id)) {
        setDraftPlans(patientId, drafts.map(p => p.id === editingPlan.id ? {
          ...p,
          ...planData,
          key: planKey,
          isSave: isSaveVal
        } : p));
      }

      // Plan düzəldikdən sonra seçimləri sıfırla
      // API çağırışı lazım deyil - useEffect avtomatik işləyəcək
      resetAllSelections();
    } else {
      // Yeni plan ekleme - API-dən gələn bütün datanı istifadə et
      const newPlan = {
        id: planData.id || Date.now(),
        ...planData,
        key: planKey,
        isSave: planData.isSave !== undefined ? planData.isSave : false
      };
      console.log('handlePlanAdd - newPlan:', newPlan); // Debug üçün
      
      if (!newPlan.isSave) {
        addDraftPlan(patientId, newPlan);
      }
      
      setPlans([...plans, newPlan]);
      setSelectedPlanId(newPlan.id);
      // API çağırışı lazım deyil - useEffect avtomatik işləyəcək (selectedPlanId dəyişdikdə)
      // Yeni plan yaratdıqdan sonra seçimləri sıfırla
      resetAllSelections();
    }
  };

  const handleDeletePlan = async (planId) => {
    setDeletingPlan(true);
    try {
      const result = await deletePlansFromStore(planId);
      
      // Sadece başarılı olduğunda (200 status) state güncelle
      if (result.success && result.status === 200) {
        removeDraftPlan(patientId, planId);
        const updatedPlans = plans.filter(plan => plan.id !== planId);
        setPlans(updatedPlans);
        // Əgər yalnız 1 plan qalıbsa, onu seç, yoxsa seçimi sıfırla
        if (updatedPlans.length === 1) {
          setSelectedPlanId(updatedPlans[0].id);
        } else if (updatedPlans.length > 1) {
          // Birdən çox plan varsa, seçimi sıfırla
          if (selectedPlanId === planId) {
            setSelectedPlanId(null);
          }
        } else {
          setSelectedPlanId(null);
        }
        // Plan silindikdən sonra, əgər başqa plan seçilibsə, patient plans datayı yenilə
        if (updatedPlans.length === 1) {
          setLoadingPatientPlans(true);
          const plansResult = await readPatientPlansFromStore(updatedPlans[0].id);
          if (plansResult.success && plansResult.status === 200) {
            setPatientPlansData(Array.isArray(plansResult.data) ? plansResult.data : []);
          }
          setLoadingPatientPlans(false);
        } else {
          setPatientPlansData([]);
        }
        message.success('Plan uğurla silindi!');
      } else {
        // Hata durumunda state güncelleme
        const status = result.status || result.error?.response?.status;
        const errorMessage = result.error?.response?.data?.message || 'Plan silinərkən xəta baş verdi';
        message.error(`Xəta (Status: ${status}): ${errorMessage}`);
      }
    } catch (error) {
      console.error('Plan silmə xətası:', error);
      message.error(error.response?.data?.message || 'Plan silinərkən xəta baş verdi');
    } finally {
      setDeletingPlan(false);
    }
  };
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
  console.log(selectedPlan);
  
  // Patient plans datada ən azı bir isSave false olub-olmadığını yoxla
  const hasUnsavedItems = patientPlansData && patientPlansData.length > 0 
    ? patientPlansData.some(item => {
        // API response strukturuna görə: { id, patientPlansDto: { isSave, ... } }
        const isSave = item.patientPlansDto?.isSave ?? item.isSave ?? false;
        return isSave === false;
      })
    : false;
  
  // Bütün seçim state-lərini sıfırla
  const resetAllSelections = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedOperationId(null);
    setSelectedOperationCode(null);
    setSelectedToothData(null);
    setResetToothSelection(true);
    setResetDrawerSelection(true);
    setTimeout(() => {
      setResetToothSelection(false);
      setResetDrawerSelection(false);
    }, 100);
  }, []);

  // Diş seçimi callback-i - təmizləmə zamanı ignore et
  const handleToothSelect = useCallback((toothData) => {
    // Əgər təmizləmə prosesindədirsə, callback-i ignore et
    if (!isClearingToothRef.current) {
      setSelectedToothData(toothData);
    }
  }, []);
  
  // Seçilmiş kateqoriya və əməliyyat məlumatlarını tap
  const getSelectedOperationInfo = () => {
    if (!selectedCategoryAndOperationItems || !selectedCategoryId || !selectedOperationId) {
      return null;
    }
    
    const category = selectedCategoryAndOperationItems.find(cat => cat.id === selectedCategoryId);
    if (!category || !category.opTypeItemReadResponses) {
      return null;
    }
    
    const operation = category.opTypeItemReadResponses.find(op => op.id === selectedOperationId);
    if (!operation) {
      return null;
    }
    
    return {
      categoryName: category.categoryName,
      operationName: operation.operationName,
      price: operation.price || 0,
    };
  };
  
  const selectedOperationInfo = getSelectedOperationInfo();
  
  // Planı təsdiqləmə funksiyası
  const handleConfirmPlan = async () => {
    if (!selectedPlanId) {
      message.warning('Zəhmət olmasa plan seçin');
      return;
    }

    setConfirmingPlan(true);
    try {
      const result = await savePatientPlanFromStore(selectedPlanId);
      
      if (result.success && result.status === 200) {
        message.success('Plan uğurla təsdiqləndi!');
        removeDraftPlan(patientId, selectedPlanId);
        // Plans listini yenilə ki isSave dəyəri yenilənsin
        if (patientId) {
          const plansResult = await fetchPlansFromStore(Number(patientId));
          if (plansResult.success && plansResult.status === 200) {
            const formattedPlans = Array.isArray(plansResult.data) 
              ? plansResult.data.map(plan => ({
                  id: plan.id,
                  'Plan Adı': plan.planName || plan.name,
                  'Sığorta Şirkəti': plan.insuranceId || plan.patientInsuranceId,
                  'Gender': plan.key === 'Yetkin' ? 'yetkin' : plan.key === 'Uşaq' ? 'usaq' : plan.key,
                  'key': plan.key,
                  isSave: plan.isSave !== undefined ? plan.isSave : false,
                }))
              : [];
            setPlans(formattedPlans);
          }
        }
        // Patient plans datayı yenilə
        setLoadingPatientPlans(true);
        const plansResult = await readPatientPlansFromStore(selectedPlanId);
        if (plansResult.success && plansResult.status === 200) {
          setPatientPlansData(Array.isArray(plansResult.data) ? plansResult.data : []);
        }
        setLoadingPatientPlans(false);
      } else {
        const status = result.status || result.error?.response?.status;
        const errorMessage = result.error?.response?.data?.message || 'Plan təsdiqlənərkən xəta baş verdi';
        message.error(`Xəta (Status: ${status}): ${errorMessage}`);
      }
    } catch (error) {
      console.error('Plan təsdiqləmə xətası:', error);
      message.error(error.response?.data?.message || 'Plan təsdiqlənərkən xəta baş verdi');
    } finally {
      setConfirmingPlan(false);
    }
  };

  // Göndər butonuna tıklandığında API'ye gönder
  const handleSendPlan = async () => {
    if (!selectedPlanId || !selectedCategoryId || !selectedOperationId || !selectedToothData) {
      message.warning('Zəhmət olmasa kategoriya, əməliyyat və diş seçin');
      return;
    }

    setSendingPlan(true);
    try {
      const payload = {
        patientPlanMainId: selectedPlanId,
        toothId: Number(selectedToothData.toathNumber),
        categoryId: Number(selectedCategoryId),
        operationId: Number(selectedOperationId),
        partOfTeethIds: (selectedToothData.pathIds || []).map(id => Number(id)),
      };

      const result = await createPatientPlanFromStore(payload);
      
      if (result.success && result.status === 200) {
        message.success('Diş uğurla göndərildi!');
        // Sadece diş seçimini temizle, categoryCode ve operationCode'u koru
        setSelectedToothData(null);
        // Diş seçimini temizle
        setResetToothSelection(true);
        // Patient plans datayı getir
        setLoadingPatientPlans(true);
        const plansResult = await readPatientPlansFromStore(selectedPlanId);
        if (plansResult.success && plansResult.status === 200) {
          setPatientPlansData(Array.isArray(plansResult.data) ? plansResult.data : []);
        } else {
          setPatientPlansData([]);
        }
        setLoadingPatientPlans(false);
        setTimeout(() => setResetToothSelection(false), 100);
      } else {
        const status = result.status || result.error?.response?.status;
        const errorMessage = result.error?.response?.data?.message || 'Diş göndərilərkən xəta baş verdi';
        message.error(`Xəta (Status: ${status}): ${errorMessage}`);
      }
    } catch (error) {
      console.error('Diş göndərmə xətası:', error);
      message.error(error.response?.data?.message || 'Diş göndərilərkən xəta baş verdi');
    } finally {
      setSendingPlan(false);
    }
  };

  // Patient insurance verilerini getir
  useEffect(() => {
    if (patientId) {
      fetchPatientInsurance(Number(patientId));
    }
  }, [patientId, fetchPatientInsurance]);

  // Planları getir
  useEffect(() => {
    const loadPlans = async () => {
      if (patientId) {
        const result = await fetchPlansFromStore(Number(patientId));
        if (result.success && result.status === 200) {
          // API'den gelen planları state'e ekle
          console.log('API Response:', result.data); // Debug üçün
          const backendPlans = Array.isArray(result.data) 
            ? result.data.map(plan => {
                console.log('Plan from API:', plan); // Debug üçün
                return {
                  id: plan.id,
                  'Plan Adı': plan.planName || plan.name,
                  'Sığorta Şirkəti': plan.insuranceId || plan.patientInsuranceId,
                  'Gender': plan.key === 'Yetkin' ? 'yetkin' : plan.key === 'Uşaq' ? 'usaq' : plan.key,
                  'key': plan.key, // Orijinal key-i saxla
                  isSave: plan.isSave !== undefined ? plan.isSave : true, // API-dan gələnlər çox ehtimal true-dur (draft-lar oxunmur)
                };
              })
            : [];
            
          const drafts = getDraftPlans(patientId);
          const backendIds = new Set(backendPlans.map(p => p.id));
          const validDrafts = drafts.filter(d => !backendIds.has(d.id));
          
          if (validDrafts.length !== drafts.length) {
            setDraftPlans(patientId, validDrafts);
          }
          
          const formattedPlans = [...backendPlans, ...validDrafts];
          setPlans(formattedPlans);
          
          // Yalnız 1 plan varsa, onu avtomatik seç
          if (formattedPlans.length === 1 && !selectedPlanId) {
            setSelectedPlanId(formattedPlans[0].id);
          } else if (formattedPlans.length === 0) {
            // Birdən çox plan yoxdursa, seçimi sıfırla
            setSelectedPlanId(null);
          }
        }
      }
    };
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  // Yalnız 1 plan varsa və heç bir plan seçilməyibsə, avtomatik seç
  useEffect(() => {
    if (plans.length === 1 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    } else if (plans.length > 1 && selectedPlanId && !plans.find(p => p.id === selectedPlanId)) {
      // Əgər seçilmiş plan artıq yoxdursa, seçimi sıfırla
      setSelectedPlanId(null);
    }
  }, [plans, selectedPlanId]);

  // Plan dəyişdikdə seçimləri sıfırla
  useEffect(() => {
    if (selectedPlanId) {
      resetAllSelections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId]);

  // Əməliyyat dəyişdikdə diş seçimini sıfırla (yalnız diş seçilmişsə və əməliyyat həqiqətən dəyişibsə)
  useEffect(() => {
    // Əgər əməliyyat həqiqətən dəyişibsə (əvvəlki dəyərdən fərqlidirsə) və diş seçilmişsə, diş seçimini təmizlə
    const operationChanged = 
      prevOperationRef.current.operationId !== selectedOperationId ||
      prevOperationRef.current.operationCode !== selectedOperationCode;
    
    if (operationChanged && selectedToothData && (selectedOperationId || selectedOperationCode)) {
      // Təmizləmə flag-i set et
      isClearingToothRef.current = true;
      // Əvvəlcə diş seçimini təmizlə
      setSelectedToothData(null);
      // Sonra reset flag-i set et
      setResetToothSelection(true);
      // Reset flag-i bir az sonra false et ki, növbəti dəfə işləsin
      setTimeout(() => {
        setResetToothSelection(false);
        // Təmizləmə flag-i də false et
        setTimeout(() => {
          isClearingToothRef.current = false;
        }, 50);
      }, 200);
    }
    
    // Əvvəlki dəyərləri yenilə (yalnız əməliyyat həqiqətən dəyişibsə)
    if (operationChanged) {
      prevOperationRef.current = {
        operationId: selectedOperationId,
        operationCode: selectedOperationCode
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOperationId, selectedOperationCode]);

  // Patient plans datayı getir - plan dəyişdikdə
  useEffect(() => {
    // Debounce üçün timeout
    const timeoutId = setTimeout(() => {
      const loadPatientPlans = async () => {
        if (selectedPlanId) {
          setLoadingPatientPlans(true);
          const result = await readPatientPlansFromStore(selectedPlanId);
          if (result.success && result.status === 200) {
            setPatientPlansData(Array.isArray(result.data) ? result.data : []);
          } else {
            setPatientPlansData([]);
          }
          setLoadingPatientPlans(false);
        } else {
          setPatientPlansData([]);
          setLoadingPatientPlans(false);
        }
      };
      loadPatientPlans();
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId]);

  return (
    <>

      {/* Plan əlavə etmək */}
      <div className='mb-4'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex-1'>
            {plansLoading ? (
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            ) : plans.length === 0 ? (
              <div className='text-gray-500'>Hələ plan yoxdur</div>
            ) : plans.length === 1 ? (
              <div className='flex items-center gap-4'>
                <div className='text-lg font-semibold'>{plans[0]['Plan Adı']}</div>
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  onClick={() => showModal(plans[0])}
                >
                  Düzəlt
                </Button>
                {plans[0].isSave === true && (
                  <Popconfirm
                    title="Planı silmək istədiyinizə əminsiniz?"
                    onConfirm={() => handleDeletePlan(plans[0].id)}
                    okText="Bəli"
                    cancelText="Xeyr"
                  >
                    <Button 
                      type="link" 
                      danger 
                      icon={<DeleteOutlined />}
                      loading={deletingPlan}
                      disabled={deletingPlan}
                    >
                      Sil
                    </Button>
                  </Popconfirm>
                )}
              </div>
            ) : (
              <div className='flex flex-col gap-2'>
                <Select
                  style={{ width: 300 }}
                  placeholder="Plan seçin"
                  value={selectedPlanId}
                  onChange={setSelectedPlanId}
                  options={plans.map(plan => ({
                    label: plan['Plan Adı'],
                    value: plan.id
                  }))}
                />
                {selectedPlan && (
                  <div className='flex items-center gap-4 mt-2'>
                    <div className='text-lg font-semibold'>{selectedPlan['Plan Adı']}</div>
                    <Button 
                      type="link" 
                      icon={<EditOutlined />} 
                      onClick={() => showModal(selectedPlan)}
                    >
                      Düzəlt
                    </Button>
                    {selectedPlan.isSave === true && (
                      <Popconfirm
                        title="Planı silmək istədiyinizə əminsiniz?"
                        onConfirm={() => handleDeletePlan(selectedPlan.id)}
                        okText="Bəli"
                        cancelText="Xeyr"
                      >
                        <Button 
                          type="link" 
                          danger 
                          icon={<DeleteOutlined />}
                          loading={deletingPlan}
                          disabled={deletingPlan}
                        >
                          Sil
                        </Button>
                      </Popconfirm>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)}>
            Plan Əlavə Et
          </Button>
        </div>
        <Modal
          title={editingPlan ? "Planı Düzəlt" : "Plan Əlavə Et"}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={600}
        >
          <AddToPlan 
            onClose={handleCancel} 
            onFinish={handlePlanAdd} 
            editingPlan={editingPlan} 
            patientId={patientId}
          />
        </Modal>
      </div>


      {/* Disler ucun filterlar
      <div>
        <Filters />
      </div> */}

      {/* Plan seçildikten sonra dişleri ve diğer öğeleri göster */}
      {selectedPlanId && (
        <>
          {/* Düz xət */}
          <Divider />
          
          {/* Plan təsdiqləmə buttonu - ən azı bir isSave false olarsa görünsün, hamısı true olsa görünməsin */}
          {selectedPlan && 
           hasUnsavedItems && 
           patientPlansData && 
           patientPlansData.length > 0 && (
            <div className='mb-4 flex justify-end'>
              <Button 
                type="primary" 
                size="large"
                icon={<SaveOutlined />}
                onClick={handleConfirmPlan}
                loading={confirmingPlan}
                disabled={confirmingPlan}
              >
                Planı Təsdiqlə
              </Button>
            </div>
          )}

          <Card>
            <Spin spinning={loadingPatientPlans} tip="Yüklənir...">
              <div className='flex gap-2'>

                <div>

                {/* secilen disleri ve kategori, emelyatlari backe gonderme buttonu */}
                <div className='flex justify-between flex-col gap-3 items-center mb-4'>
                  <Button 
                    type="default" 
                    icon={<UnorderedListOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-2"
                  >
                    Kateqoriya və Əməliyyat seçimi
                  </Button>
                  
                  {/* Seçilmiş əməliyyat məlumatı info card */}
                  {selectedOperationInfo && (
                    <Card 
                      size="small" 
                      className="w-full"
                      style={{ 
                        backgroundColor: '#f0f9ff',
                        borderColor: '#3b82f6',
                        borderWidth: '1px'
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-gray-600 font-medium">
                          {selectedOperationInfo.categoryName}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-800">
                            {selectedOperationInfo.operationName}
                          </span>
                          {selectedOperationInfo.price > 0 && (
                            <span className="text-sm font-bold text-blue-600">
                              {selectedOperationInfo.price} ₼
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={handleSendPlan}
                    disabled={!selectedPlanId || !selectedCategoryId || !selectedOperationId || !selectedToothData || sendingPlan}
                    loading={sendingPlan}
                  >
                    Göndər
                  </Button>
                </div>

                {/* Drawer - Kategoriyalar ve Emelyatlar */}
                <Drawer
                  title={
                    <div className="flex items-center gap-2">
                      <UnorderedListOutlined />
                      <span>Kateqoriya və Əməliyyat Seçimi</span>
                    </div>
                  }
                  placement="left"
                  width={600}
                  onClose={() => setIsDrawerOpen(false)}
                  open={isDrawerOpen}
                  styles={{
                    body: {
                      padding: 0,
                    }
                  }}
                >
                  <DualSelectTable 
                    // Burada patientId yox, seçilmiş planın insuranceId-si göndərilir
                    insuranceId={selectedPlan ? selectedPlan['Sığorta Şirkəti'] : null}
                    onOperationSelect={setSelectedOperationCode}
                    onCategoryAndOperationSelect={(categoryId, operationId) => {
                      setSelectedCategoryId(categoryId);
                      setSelectedOperationId(operationId);
                      // Əməliyyat seçildikdə API çağırışı etmək lazım deyil - yalnız state güncəllə
                    }}
                    resetSelection={resetDrawerSelection}
                  />
                </Drawer>
              </div>

              {/* Disler */}
              <div className='ms-5'>
                <Svg 
                  categoryCode={selectedOperationCode} 
                  onToothSelect={handleToothSelect}
                  resetSelection={resetToothSelection}
                  patientPlansData={patientPlansData}
                  planKey={selectedPlan?.key || null}
                />
              </div>

            </div>
            </Spin>
          </Card>

          {/* Plan Əməliyyatları cədvəli - yalnız data varsa görünsün */}
          {patientPlansData && patientPlansData.length > 0 && (
            <>
              <Divider />
              <PlansTable 
                data={patientPlansData} 
                onDelete={async (id) => {
                  setDeletingPlanItem(true);
                  try {
                    const result = await deletePatientPlanItemFromStore(id);
                    if (result.success && result.status === 200) {
                      message.success('Əməliyyat uğurla silindi!');
                      // Patient plans datayı yenilə
                      setLoadingPatientPlans(true);
                      const plansResult = await readPatientPlansFromStore(selectedPlanId);
                      if (plansResult.success && plansResult.status === 200) {
                        setPatientPlansData(Array.isArray(plansResult.data) ? plansResult.data : []);
                      }
                      setLoadingPatientPlans(false);
                    } else {
                      const status = result.status || result.error?.response?.status;
                      const errorMessage = result.error?.response?.data?.message || 'Əməliyyat silinərkən xəta baş verdi';
                      message.error(`Xəta (Status: ${status}): ${errorMessage}`);
                    }
                  } catch (error) {
                    console.error('Əməliyyat silmə xətası:', error);
                    message.error(error.response?.data?.message || 'Əməliyyat silinərkən xəta baş verdi');
                  } finally {
                    setDeletingPlanItem(false);
                  }
                }}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Plans;



