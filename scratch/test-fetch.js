async function main() {
  const BASE_API = 'http://169.58.183.137:5555/api/v1';
  const USERNAME = 'super_admin';
  const PASSWORD = 'super1234';

  console.log('Logging in...');
  const loginRes = await fetch(`${BASE_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  const loginData = await loginRes.json();
  const token = loginData.tokenPair.accessToken;
  console.log('Logged in successfully');

  // Try creating a patient
  const patientData = {
    name: 'QA Test Patient',
    surname: 'Test001',
    patronymic: 'QA',
    phone: '(555)-555-5555',
    genderStatus: 'MAN',
    dateOfBirth: '1990-01-15',
    priceCategoryName: 'VIP', // let's see if this is needed or if we can read price categories first
    doctorId: '1',
    specializationName: 'Therapist',
  };

  console.log('Sending patient create...');
  const response = await fetch(`${BASE_API}/patient/create`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(patientData),
  });
  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

main();
