import React, { useState } from 'react';
import { IonContent, IonPage, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonModal, IonSegment, IonSegmentButton, IonLabel, IonItem, IonInput, IonSelect, IonSelectOption, IonIcon } from '@ionic/react';
import { locationOutline, mapOutline, carOutline } from 'ionicons/icons';
import '../../assets/css/home.css';
import Map from '../../components/Map';

const Home: React.FC = () => {
  const [isBooking, setIsBooking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [serviceType, setServiceType] = useState('Pahatod');
  const [pickupName, setPickupName] = useState('Fetching location...');
  const [dropoffName, setDropoffName] = useState('');
  const [vehicle, setVehicle] = useState('Motorcycle - Automatic');

  const startBooking = () => {
    setIsBooking(true);
    setShowModal(true);
  };

  const handleLocationSelect = (locationName: string, lat: number, lng: number) => {
    // For simplicity, we just update the pickup location when the pin is dragged.
    setPickupName(locationName);
  };

  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen>
        <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <Map 
              isBlurred={!isBooking} 
              isBooking={isBooking} 
              onLocationSelect={handleLocationSelect} 
            />
          </div>
          
          {/* Overlay Card when not booking */}
          {!isBooking && (
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '400px',
              zIndex: 1000
            }}>
              <IonCard style={{ margin: 0, borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                <IonCardHeader className="ion-text-center" style={{ paddingBottom: '10px' }}>
                  <IonCardTitle style={{ fontSize: '1.3rem', fontWeight: '700' }}>Ready for a ride?</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="ion-text-center" style={{ marginBottom: '16px', color: '#666' }}>
                    Get to your destination quickly and safely.
                  </p>
                  <IonButton expand="block" shape="round" style={{ height: '50px', fontSize: '1.1rem' }} onClick={startBooking}>
                    Book a Ride
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </div>
          )}

          {/* Bottom Sheet Modal for Booking */}
          <IonModal
            isOpen={showModal}
            initialBreakpoint={0.5}
            breakpoints={[0, 0.5, 0.9]}
            onDidDismiss={() => {
              setShowModal(false);
              setIsBooking(false);
            }}
            backdropDismiss={false}
            backdropBreakpoint={0.5}
          >
            <IonContent className="ion-padding">
              <h2 style={{ marginTop: '0', marginBottom: '16px', fontWeight: 'bold' }}>Create Booking</h2>
              
              {/* Service Selection */}
              <IonSegment 
                value={serviceType} 
                onIonChange={e => setServiceType(e.detail.value as string)}
                style={{ marginBottom: '20px' }}
              >
                <IonSegmentButton value="Pahatod">
                  <IonLabel>Pahatod</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="Padala">
                  <IonLabel>Padala</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="PasaBuy">
                  <IonLabel>PasaBuy</IonLabel>
                </IonSegmentButton>
              </IonSegment>

              {/* Location Fields */}
              <IonItem className="ion-margin-bottom" style={{ borderRadius: '10px' }}>
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonInput 
                  label="Pickup Location" 
                  labelPlacement="floating" 
                  value={pickupName} 
                  readonly 
                />
              </IonItem>

              <IonItem className="ion-margin-bottom" style={{ borderRadius: '10px' }}>
                <IonIcon icon={mapOutline} slot="start" color="secondary" />
                <IonInput 
                  label="Dropoff Location" 
                  labelPlacement="floating" 
                  placeholder="Where to?" 
                  value={dropoffName}
                  onIonInput={e => setDropoffName(e.detail.value as string)}
                />
              </IonItem>

              {/* Vehicle Selection */}
              <IonItem className="ion-margin-bottom" style={{ borderRadius: '10px' }}>
                <IonIcon icon={carOutline} slot="start" color="tertiary" />
                <IonSelect 
                  label="Vehicle Type" 
                  labelPlacement="floating" 
                  value={vehicle} 
                  onIonChange={e => setVehicle(e.detail.value)}
                >
                  <IonSelectOption value="Motorcycle - Automatic">Motorcycle - Automatic</IonSelectOption>
                  <IonSelectOption value="Motorcycle - Manual">Motorcycle - Manual</IonSelectOption>
                  <IonSelectOption value="Car - 4 Seater">Car - 4 Seater</IonSelectOption>
                  <IonSelectOption value="Tricycle">Tricycle</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonButton expand="block" shape="round" className="ion-margin-top" style={{ height: '50px' }}>
                Confirm Booking
              </IonButton>
            </IonContent>
          </IonModal>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
