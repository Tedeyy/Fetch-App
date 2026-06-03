import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonInput,
  IonButton,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  useIonToast,
  IonSpinner
} from '@ionic/react';
import { supabase } from '../../supabaseClient';
import { useHistory } from 'react-router-dom';
import './profileCompletion.css';

const ProfileCompletion: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [provinceName, setProvinceName] = useState('');
  const [cityName, setCityName] = useState('');
  const [barangayName, setBarangayName] = useState('');

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const res = await fetch('https://psgc.gitlab.io/api/provinces');
      const data = await res.json();
      data.push({ code: '130000000', name: 'METRO MANILA' }); // Add NCR to list
      data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setProvinces(data);
    } catch (e) {
      console.error(e);
      present({ message: 'Failed to load provinces', duration: 2000, color: 'danger' });
    }
  };

  const fetchCities = async (provinceCode: string) => {
    try {
      let url = `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities`;
      if (provinceCode === '130000000') {
        url = 'https://psgc.gitlab.io/api/regions/130000000/cities-municipalities';
      }
      const res = await fetch(url);
      const data = await res.json();
      data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setCities(data);
    } catch (e) {
      console.error(e);
      present({ message: 'Failed to load cities', duration: 2000, color: 'danger' });
    }
  };

  const fetchBarangays = async (cityCode: string) => {
    try {
      const res = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays`);
      const data = await res.json();
      data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setBarangays(data);
    } catch (e) {
      console.error(e);
      present({ message: 'Failed to load barangays', duration: 2000, color: 'danger' });
    }
  };

  const handleProvinceChange = (e: any) => {
    const code = e.detail.value;
    if (!code) return;
    setSelectedProvince(code);
    const p = provinces.find(x => x.code === code);
    setProvinceName(p ? p.name : '');
    setCities([]);
    setBarangays([]);
    setSelectedCity('');
    setSelectedBarangay('');
    fetchCities(code);
  };

  const handleCityChange = (e: any) => {
    const code = e.detail.value;
    if (!code) return;
    setSelectedCity(code);
    const c = cities.find(x => x.code === code);
    setCityName(c ? c.name : '');
    setBarangays([]);
    setSelectedBarangay('');
    fetchBarangays(code);
  };

  const handleBarangayChange = (e: any) => {
    const code = e.detail.value;
    if (!code) return;
    setSelectedBarangay(code);
    const b = barangays.find(x => x.code === code);
    setBarangayName(b ? b.name : '');
  };

  const handleNextStep1 = () => {
    if (!selectedProvince || !selectedCity || !selectedBarangay || !address.trim()) {
      present({ message: 'Please fill out all address fields.', duration: 2000, color: 'warning' });
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!contactNumber.trim()) {
      present({ message: 'Please enter a contact number.', duration: 2000, color: 'warning' });
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!agreed) {
      present({ message: 'You must agree to the Terms and Privacy Policy.', duration: 2000, color: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session.');

      const { error } = await supabase
        .from('profiles')
        .update({
          province: provinceName,
          city: cityName,
          barangay: barangayName,
          address: address.trim(),
          contact_number: contactNumber.trim()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      present({ message: 'Profile updated successfully!', duration: 2000, color: 'success' });
      
      // Force reload to trigger App.tsx profile check
      window.location.href = '/home';
    } catch (e: any) {
      present({ message: e.message || 'Failed to update profile.', duration: 3000, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="profile-completion-content">
        <div className="profile-completion-container">
          <IonCard className="profile-completion-card">
            <IonCardContent>
              <div className="profile-completion-header">
                <h2>Complete Your Profile</h2>
                <p>Step {step} of 3</p>
              </div>

              {step === 1 && (
                <div className="step-content">
                  <IonItem className="pc-item" lines="none">
                    <IonSelect placeholder="Select Province" value={selectedProvince} onIonChange={handleProvinceChange} style={{width: '100%'}}>
                      {provinces.map(p => (
                        <IonSelectOption key={p.code} value={p.code}>{p.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                  <IonItem className="pc-item" lines="none">
                    <IonSelect placeholder="Select City/Municipality" value={selectedCity} onIonChange={handleCityChange} disabled={!selectedProvince} style={{width: '100%'}}>
                      {cities.map(c => (
                        <IonSelectOption key={c.code} value={c.code}>{c.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                  <IonItem className="pc-item" lines="none">
                    <IonSelect placeholder="Select Barangay" value={selectedBarangay} onIonChange={handleBarangayChange} disabled={!selectedCity} style={{width: '100%'}}>
                      {barangays.map(b => (
                        <IonSelectOption key={b.code} value={b.code}>{b.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                  <IonItem className="pc-item" lines="none">
                    <IonInput className="pc-input" placeholder="Street Name, Building, House No." value={address} onIonInput={(e: any) => setAddress(e.detail.value)} />
                  </IonItem>
                  <IonButton expand="block" className="pc-button" onClick={handleNextStep1}>Next</IonButton>
                </div>
              )}

              {step === 2 && (
                <div className="step-content">
                  <p style={{fontSize: '14px', color: 'var(--ion-color-medium)', marginBottom: '16px'}}>
                    Please provide your active contact number. 
                    <br/><i>(OTP Verification will be implemented here soon)</i>
                  </p>
                  <IonItem className="pc-item" lines="none">
                    <IonInput className="pc-input" type="tel" placeholder="e.g. +639123456789" value={contactNumber} onIonInput={(e: any) => setContactNumber(e.detail.value)} />
                  </IonItem>
                  <IonButton expand="block" className="pc-button" onClick={handleNextStep2}>Next</IonButton>
                  <IonButton expand="block" fill="outline" className="pc-button-outline" onClick={() => setStep(1)}>Back</IonButton>
                </div>
              )}

              {step === 3 && (
                <div className="step-content">
                  <div className="summary-list">
                    <div className="summary-item">
                      <span className="summary-label">Province</span>
                      <span className="summary-value">{provinceName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">City</span>
                      <span className="summary-value">{cityName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Barangay</span>
                      <span className="summary-value">{barangayName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Address</span>
                      <span className="summary-value">{address}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Contact No.</span>
                      <span className="summary-value">{contactNumber}</span>
                    </div>
                  </div>

                  <IonItem lines="none" style={{'--background': 'transparent'}}>
                    <IonCheckbox slot="start" checked={agreed} onIonChange={e => setAgreed(e.detail.checked)} />
                    <span style={{fontSize: '14px', color: 'var(--ion-color-medium)'}}>
                      I agree to the <a href="/policy" target="_blank" style={{textDecoration: 'none'}}>Terms and Privacy Policy</a>
                    </span>
                  </IonItem>

                  <IonButton expand="block" className="pc-button" onClick={handleSubmit} disabled={loading}>
                    {loading ? <IonSpinner name="crescent" /> : 'Submit & Finish'}
                  </IonButton>
                  <IonButton expand="block" fill="outline" className="pc-button-outline" onClick={() => setStep(2)} disabled={loading}>
                    Back
                  </IonButton>
                </div>
              )}

            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfileCompletion;
