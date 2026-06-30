import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom';
import "@ant-design/v5-patch-for-react-19"; // React 19 uyumluluğu için gerekli
import 'antd/dist/reset.css';
import { Select, Space, Divider, Card, Button, Form, message, Drawer, Spin } from 'antd';
import {  SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined, LoadingOutlined } from '@ant-design/icons';
import Svg from './Components/Teths/svg';
import DualSelectTable from './Components/Page/dualSelectTable';
import AddToPlan from './Components/Page/addToPlan';
import PlansTable from './Components/Page/plansTable';
import usePatientInsuranceStore from '../../../../stores/patientInsuranceStore';
import usePlansStore from '../../../../stores/plans';
import usePatientPlansControllerStore from '../../../../stores/patient-plans-controller';
import useTreatmentStore from '../../../../stores/treatmentStore'; 

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
  const [tableSelectedRowKeys, setTableSelectedRowKeys] = useState([]);
  const [tableSelectedToothData, setTableSelectedToothData] = useState(null); // { toothNumbers: [], partOfToothIds: [] }
  const [svgSelectedToothData, setSvgSelectedToothData] = useState(null); // interactiveSVG-dən gələn seçim
  const isTableSelectionRef = useRef(false); // Table-dan gələn seçimləri izlə
  const isClearingToothRef = useRef(false); // Diş seçimini təmizlədiyimizi izlə
  const [useExternalSelection, setUseExternalSelection] = useState(false); // External selection istifadə et
  const prevOperationRef = useRef({ operationId: null, operationCode: null }); // Əvvəlki əməliyyat dəyərlərini izlə

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
    deletePatientPlanItem: deletePatientPlanItemFromStore,
    savePatientPlan: savePatientPlanFromStore,
    patientPlansData: storePatientPlansData,
  } = usePatientPlansControllerStore();

  const {
    createPatientTreatment: createPatientTreatmentFromStore,
    readPatientTreatmentByPlanMainId: readPatientTreatmentByPlanMainIdFromStore,
    readCategoryAndOperationsByPlanMainId: readCategoryAndOperationsByPlanMainIdFromStore,
    selectedCategoryAndOperationItems,
    loading: treatmentLoading,
  } = useTreatmentStore();

  const showModal = (plan = null) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handlePlanAdd = async (planData) => {
    // Gender-i key-ə çevir
    const planKey = planData['Gender'] === 'yetkin' ? 'Yetkin' : planData['Gender'] === 'usaq' ? 'Uşaq' : planData['Gender'];
    
    if (editingPlan) {
      // Plan düzenleme - API çağrısı addToPlan içinde yapıldı, sadece state güncelle
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id 
          ? { ...plan, ...planData, key: planKey }
          : plan
      ));
      // Plan düzəldikdən sonra seçimləri sıfırla
      // API çağırışı lazım deyil - useEffect avtomatik işləyəcək
      resetAllSelections();
    } else {
      // Yeni plan ekleme - API çağrısı addToPlan içinde yapıldı, sadece state güncelle
      const newPlan = {
        id: planData.id || Date.now(),
        ...planData,
        key: planKey
      };
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
          const plansResult = await readPatientTreatmentByPlanMainIdFromStore(updatedPlans[0].id);
          if (plansResult.success && plansResult.status === 200) {
            // Yeni response strukturuna görə: { key, patientPlanMainId, isSave, plans: [...] }
            const plansArray = plansResult.data?.plans || plansResult.data;
            setPatientPlansData(Array.isArray(plansArray) ? plansArray : []);
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
    if (isClearingToothRef.current) {
      return;
    }
    
    setSelectedToothData(toothData);
    // interactiveSVG-dən gələn seçimi table-a göndər (yalnız table-dan seçim yoxdursa)
    if (!isTableSelectionRef.current && toothData) {
      setSvgSelectedToothData(toothData);
      setUseExternalSelection(true); // External selection istifadə et
      // Table-dan seçilmiş row keys-ləri tap
      // Yeni format: { key, patientPlanId, categoryId, categoryName, categoryCode, toothNo, details: [{ id, partOfToothId, operationName, price }] }
      // Artık sadece diş key'leri (patientPlanId) kullanıyoruz
      const toothDataArray = Array.isArray(toothData) ? toothData : [toothData];
      
      // Seçilmiş diş nömrələri və pathIds-ə uyğun diş key'lerini tap
      const matchingRowKeys = patientPlansData
        .filter(item => {
          const matchingTooth = toothDataArray.find(t => 
            (t.toathNumber === item.toothNo) || (t.toothNumber && Number(t.toothNumber) === Number(item.toothNo))
          );
          if (!matchingTooth) return false;
          const pathIds = matchingTooth.pathIds || [];
          // Eğer pathIds varsa, bu dişin details'lerinde bu pathId'lerden biri olmalı
          if (pathIds.length > 0) {
            const details = item.details || [];
            return details.some(detail => pathIds.includes(detail.partOfToothId));
          }
          // pathIds yoksa, dişi seç
          return true;
        })
        .map(item => item.patientPlanId);
      
      setTableSelectedRowKeys(matchingRowKeys);
    } else if (!isTableSelectionRef.current && !toothData) {
      setSvgSelectedToothData(null);
      setTableSelectedRowKeys([]);
      setUseExternalSelection(false);
      // Table-dakı seçimləri təmizləmək üçün externalSelectedRowKeys-i null göndər
      // Bu plansTable-dakı useEffect tərəfindən işlənəcək
    }
  }, [patientPlansData]);
  
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
        // Patient plans datayı yenilə
        setLoadingPatientPlans(true);
        const plansResult = await readPatientTreatmentByPlanMainIdFromStore(selectedPlanId);
        if (plansResult.success && plansResult.status === 200) {
          // Yeni response strukturuna görə: { key, patientPlanMainId, isSave, plans: [...] }
          const plansArray = plansResult.data?.plans || plansResult.data;
          setPatientPlansData(Array.isArray(plansArray) ? plansArray : []);
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
        // Sadece diş seçimini temizle, categoryCode ve operationCode'u qoru
        setSelectedToothData(null);
        // Diş seçimini temizle
        setResetToothSelection(true);
        // Patient plans datayı getir
        setLoadingPatientPlans(true);
        const plansResult = await readPatientTreatmentByPlanMainIdFromStore(selectedPlanId);
        if (plansResult.success && plansResult.status === 200) {
          // Yeni response strukturuna görə: { key, patientPlanMainId, isSave, plans: [...] }
          const plansArray = plansResult.data?.plans || plansResult.data;
          setPatientPlansData(Array.isArray(plansArray) ? plansArray : []);
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
          const formattedPlans = Array.isArray(result.data) 
            ? result.data.map(plan => ({
                id: plan.id,
                'Plan Adı': plan.planName || plan.name,
                'Sığorta Şirkəti': plan.insuranceId || plan.patientInsuranceId,
                'Gender': plan.key === 'Yetkin' ? 'yetkin' : plan.key === 'Uşaq' ? 'usaq' : plan.key,
                'key': plan.key, // Orijinal key-i saxla
              }))
            : [];
          setPlans(formattedPlans);
          // Yalnız 1 plan varsa, onu avtomatik seç
          if (formattedPlans.length === 1) {
            setSelectedPlanId(formattedPlans[0].id);
          } else {
            // Birdən çox plan varsa, seçimi sıfırla
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
    
    if (operationChanged && selectedToothData && (selectedOperationId || selectedOperationCode) && !isTableSelectionRef.current) {
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

  // selectedCategoryAndOperationItems yüklendiğinde ve tableSelectedRowKeys varsa, kategori ve emeliyatı otomatik seç
  // Bu useEffect, PlansTable'da diş seçildiğinde ve veri yüklendiğinde otomatik çalışır
  // DualSelectTable açılmadan önce de otomatik çalışır
  useEffect(() => {
    if (selectedCategoryAndOperationItems && selectedCategoryAndOperationItems.length > 0 && tableSelectedRowKeys.length > 0 && patientPlansData.length > 0) {
      // İlk seçilen dişin patientPlanId'sini al
      const firstSelectedPatientPlanId = tableSelectedRowKeys[0];
      
      // patientPlansData'dan bu dişi bul
      const selectedToothData = patientPlansData.find(item => 
        item.patientPlanId === firstSelectedPatientPlanId
      );
      
      if (selectedToothData) {
        // categoryCode veya categoryId'ye göre kategoriyi bul
        const matchingCategory = selectedCategoryAndOperationItems.find(cat => 
          cat.categoryCode === selectedToothData.categoryCode || 
          cat.id === selectedToothData.categoryId
        );
        
        if (matchingCategory) {
          // Kategoriyi seç (her zaman güncelle, böylece DualSelectTable'a prop geçer)
          setSelectedCategoryId(matchingCategory.id);
          
          // Seçilen dişin details'lerinden ilk detail'in operationName'ini al
          const firstDetail = selectedToothData.details && selectedToothData.details.length > 0 
            ? selectedToothData.details[0] 
            : null;
          
          if (firstDetail && firstDetail.operationName) {
            // Bu kategorideki emeliyatlar arasında operationName'e göre eşleşen emeliyatı bul
            const operations = matchingCategory.opTypeItemReadResponses || [];
            const matchingOperation = operations.find(op => 
              op.operationName === firstDetail.operationName
            );
            
            if (matchingOperation) {
              // Eşleşen emeliyatı seç
              setSelectedOperationId(matchingOperation.id);
              
              // operationCode'u da set et
              if (matchingOperation.operationCode) {
                setSelectedOperationCode(Number(matchingOperation.operationCode));
              }
            } else if (operations.length > 0) {
              // Eşleşen emeliyat yoxdursa, ilk emeliyatı seç
              const firstOperation = operations[0];
              setSelectedOperationId(firstOperation.id);
              
              if (firstOperation.operationCode) {
                setSelectedOperationCode(Number(firstOperation.operationCode));
              }
            }
          } else {
            // operationName yoxdursa, ilk emeliyatı seç
            const operations = matchingCategory.opTypeItemReadResponses || [];
            if (operations.length > 0) {
              const firstOperation = operations[0];
              setSelectedOperationId(firstOperation.id);
              
              if (firstOperation.operationCode) {
                setSelectedOperationCode(Number(firstOperation.operationCode));
              }
            }
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryAndOperationItems, tableSelectedRowKeys, patientPlansData]);

  // Patient plans datayı getir - plan dəyişdikdə
  useEffect(() => {
    // Debounce üçün timeout
    const timeoutId = setTimeout(() => {
      const loadPatientPlans = async () => {
        if (selectedPlanId) {
          setLoadingPatientPlans(true);
          const result = await readPatientTreatmentByPlanMainIdFromStore(selectedPlanId);
          if (result.success && result.status === 200) {
            // Yeni response strukturuna görə: { key, patientPlanMainId, isSave, plans: [...] }
            const plansArray = result.data?.plans || result.data;
            setPatientPlansData(Array.isArray(plansArray) ? plansArray : []);
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
                <div className='text-lg font-semibold'>Plan adı: {plans[0]['Plan Adı']}</div>
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
                
              </div>
            )}
          </div>
        </div>
        
      </div>


      {/* Plan seçildikten sonra dişleri ve diğer öğeleri göster */}
      {selectedPlanId && (
        <>
          {/* Düz xət */}
          <Divider />
          
          {/* Plan təsdiqləmə buttonu - yalnız data varsa görünsün */}
          {patientPlansData && patientPlansData.length > 0 && (
            <div className='mb-4 flex justify-end'>
              <Button 
                type="primary" 
                size="large"
                icon={<SaveOutlined />}
                onClick={handleConfirmPlan}
                loading={confirmingPlan}
                disabled={confirmingPlan}
              >
                Müalicəni Təsdiqlə
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
                    // Yeni API: seçilmiş planın ID-sini göndər
                    planId={selectedPlanId}
                    onOperationSelect={setSelectedOperationCode}
                    onCategoryAndOperationSelect={(categoryId, operationId) => {
                      setSelectedCategoryId(categoryId);
                      setSelectedOperationId(operationId);
                      // Əməliyyat seçildikdə API çağırışı etmək lazım deyil - yalnız state güncəllə
                    }}
                    resetSelection={resetDrawerSelection}
                    initialCategoryId={selectedCategoryId}
                    initialOperationId={selectedOperationId}
                    drawerOpen={isDrawerOpen}
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
                  externalSelection={tableSelectedToothData}
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
                externalSelectedRowKeys={useExternalSelection ? (tableSelectedRowKeys.length > 0 ? tableSelectedRowKeys : []) : null}
                onSelectionChange={(selectedIds, selectedRowsData) => {
                  isTableSelectionRef.current = true; // Flag set et
                  setUseExternalSelection(false); // Table öz state-ini idarə etsin
                  
                  // Table-dan seçilmiş sətirlərdən diş nömrələrini və partOfToothId-ləri çıxar
                  // selectedRowsData-dan birbaşa istifadə et ki, hansı sətirlərin seçildiyini bilək
                  const selectedRows = selectedRowsData || [];
                  
                  // Diş nömrələrini və partOfToothId-ləri qrupla
                  const toothNumbers = [...new Set(selectedRows.map(r => r.toothNo))];
                  const partOfToothIds = selectedRows
                    .map(r => r.partOfToothId)
                    .filter(id => id !== null && id !== undefined);
                  
                  setTableSelectedToothData({
                    toothNumbers,
                    partOfToothIds
                  });
                  
                  // Table row keys-ləri tap - artık sadece diş key'leri (patientPlanId)
                  // selectedIds zaten patientPlanId'ler, bunları direkt key olarak kullan
                  const rowKeys = selectedIds;
                  
                  // Table-dan seçim edildikdə, tableSelectedRowKeys-i yenilə (interactiveSVG-yə göndərmək üçün)
                  // Amma externalSelectedRowKeys null qalmalıdır ki, table öz state-ini idarə etsin
                  setTableSelectedRowKeys(rowKeys);
                  
                  // Kategori və emeliyat seçilmemişse, seçilen dişin categoryCode veya categoryId'sine göre otomatik seç
                  if (selectedIds.length > 0 && patientPlansData.length > 0) {
                    // İlk seçilen dişin patientPlanId'sini al
                    const firstSelectedPatientPlanId = selectedIds[0];
                    
                    // patientPlansData'dan bu dişi bul
                    const selectedToothData = patientPlansData.find(item => 
                      item.patientPlanId === firstSelectedPatientPlanId
                    );
                    
                    if (selectedToothData) {
                      // ÖNCE categoryCode'u hemen set et ki SVG'de dişler görünsün (drawer açılmadan önce)
                      // Bu çok önemli - drawer açılmadan önce dişlerin görünmesi için
                      if (selectedToothData.categoryCode) {
                        // categoryCode'u number'a çevir
                        const categoryCodeNum = Number(selectedToothData.categoryCode);
                        if (!isNaN(categoryCodeNum)) {
                          setSelectedOperationCode(categoryCodeNum);
                        }
                      }
                      
                      // Eğer selectedCategoryAndOperationItems yüklenmemişse, yükle
                      // Böylece DualSelectTable açılmadan önce de otomatik çalışır
                      if ((!selectedCategoryAndOperationItems || selectedCategoryAndOperationItems.length === 0) && selectedPlanId) {
                        // Yeni API: plan main ID göndər
                        readCategoryAndOperationsByPlanMainIdFromStore(selectedPlanId);
                      }
                      
                      // Sonra kategori ve emeliyatı seç (eğer selectedCategoryAndOperationItems yüklüyse)
                      if (selectedCategoryAndOperationItems && selectedCategoryAndOperationItems.length > 0) {
                        // categoryCode veya categoryId'ye göre kategoriyi bul
                        const matchingCategory = selectedCategoryAndOperationItems.find(cat => 
                          cat.categoryCode === selectedToothData.categoryCode || 
                          cat.id === selectedToothData.categoryId
                        );
                        
                        if (matchingCategory) {
                          // Kategoriyi seç - her zaman güncelle
                          setSelectedCategoryId(matchingCategory.id);
                          
                          // Seçilen dişin details'lerinden ilk detail'in operationName'ini al
                          const firstDetail = selectedToothData.details && selectedToothData.details.length > 0 
                            ? selectedToothData.details[0] 
                            : null;
                          
                          if (firstDetail && firstDetail.operationName) {
                            // Bu kategorideki emeliyatlar arasında operationName'e göre eşleşen emeliyatı bul
                            const operations = matchingCategory.opTypeItemReadResponses || [];
                            const matchingOperation = operations.find(op => 
                              op.operationName === firstDetail.operationName
                            );
                            
                            if (matchingOperation) {
                              // Eşleşen emeliyatı seç
                              setSelectedOperationId(matchingOperation.id);
                              
                              // operationCode'u da set et (eğer varsa, yoksa categoryCode kalsın)
                              if (matchingOperation.operationCode) {
                                setSelectedOperationCode(Number(matchingOperation.operationCode));
                              }
                            } else if (operations.length > 0) {
                              // Eşleşen emeliyat yoxdursa, ilk emeliyatı seç
                              const firstOperation = operations[0];
                              setSelectedOperationId(firstOperation.id);
                              
                              if (firstOperation.operationCode) {
                                setSelectedOperationCode(Number(firstOperation.operationCode));
                              }
                            }
                          } else {
                            // operationName yoxdursa, ilk emeliyatı seç
                            const operations = matchingCategory.opTypeItemReadResponses || [];
                            if (operations.length > 0) {
                              const firstOperation = operations[0];
                              setSelectedOperationId(firstOperation.id);
                              
                              if (firstOperation.operationCode) {
                                setSelectedOperationCode(Number(firstOperation.operationCode));
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  
                  // Flag-i reset et
                  setTimeout(() => {
                    isTableSelectionRef.current = false;
                  }, 100);
                }}
                onConfirmSelection={async (selectedIds, selectedRowsData) => {
                  if (!selectedPlanId) {
                    message.warning('Zəhmət olmasa plan seçin');
                    return;
                  }

                  if (!selectedIds || selectedIds.length === 0) {
                    message.warning('Zəhmət olmasa ən azı bir əməliyyat seçin');
                    return;
                  }

                  try {
                    // Seçilmiş sətirlərdən unique patientPlanId-ləri çıxar
                    // Bir diş seçildiğində, o dişin kaç parçası olursa olsun, bir dəfə göndərmək lazımdır
                    const uniquePatientPlanIds = [...new Set(selectedRowsData.map(row => row.id))];
                    
                    const patientPlansRequests = uniquePatientPlanIds
                      .map(patientPlanId => {
                        return {
                          planId: patientPlanId, // patientPlanId
                          isChecked: true
                        };
                      })
                      .filter(item => item.planId !== null && item.planId !== undefined);

                    const payload = {
                      planMainId: selectedPlanId,
                      patientPlansRequests: patientPlansRequests
                    };

                    const result = await createPatientTreatmentFromStore(payload);

                    if (result.success && (result.status === 200 || result.status === 201)) {
                      message.success('Əməliyyatlar uğurla təsdiqləndi!');
                      // Patient plans datayı yenilə
                      setLoadingPatientPlans(true);
                      const plansResult = await readPatientTreatmentByPlanMainIdFromStore(selectedPlanId);
                      if (plansResult.success && (plansResult.status === 200 || plansResult.status === 201)) {
                        // Yeni response strukturuna görə: { key, patientPlanMainId, isSave, plans: [...] }
                        const plansArray = plansResult.data?.plans || plansResult.data;
                        setPatientPlansData(Array.isArray(plansArray) ? plansArray : []);
                      }
                      setLoadingPatientPlans(false);
                    } else {
                      const status = result.status || result.error?.response?.status;
                      const errorMessage = result.error?.response?.data?.message || 'Əməliyyatlar təsdiqlənərkən xəta baş verdi';
                      message.error(`Xəta (Status: ${status}): ${errorMessage}`);
                    }
                  } catch (error) {
                    console.error('Əməliyyatlar təsdiqləmə xətası:', error);
                    message.error(error.response?.data?.message || 'Əməliyyatlar təsdiqlənərkən xəta baş verdi');
                  }
                }}
                onDelete={async (id) => {
                  setDeletingPlanItem(true);
                  try {
                    const result = await deletePatientPlanItemFromStore(id);
                    if (result.success && result.status === 200) {
                      message.success('Əməliyyat uğurla silindi!');
                      // Patient plans datayı yenilə
                      setLoadingPatientPlans(true);
                      const plansResult = await readPatientTreatmentByPlanMainIdFromStore(selectedPlanId);
                      if (plansResult.success && plansResult.status === 200) {
                        // Yeni response strukturuna görə: { key, patientPlanMainId, isSave, plans: [...] }
                        const plansArray = plansResult.data?.plans || plansResult.data;
                        setPatientPlansData(Array.isArray(plansArray) ? plansArray : []);
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
