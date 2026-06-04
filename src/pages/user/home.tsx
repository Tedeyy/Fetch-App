import React, { useState } from 'react';
import { IonContent, IonPage, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonModal, IonSegment, IonSegmentButton, IonLabel, IonItem, IonInput, IonIcon, IonTextarea, useIonToast } from '@ionic/react';
import { locationOutline, mapOutline, cubeOutline, chatbubbleOutline } from 'ionicons/icons';
import '../../assets/css/home.css';
import Map from '../../components/Map';
import { supabase } from '../../supabaseClient';

const Home: React.FC = () => {
  const [presentToast] = useIonToast();

  const [isBooking, setIsBooking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [waitingForRider, setWaitingForRider] = useState(false);
  
  const [serviceType, setServiceType] = useState('Pahatod');
  const [activeLocationField, setActiveLocationField] = useState<'pickup' | 'dropoff'>('pickup');
  
  const [pickupName, setPickupName] = useState('Fetching location...');
  const [dropoffName, setDropoffName] = useState('Unknown Location');
  
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([8.367951, 124.865832]);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number]>([8.368951, 124.866832]);

  const [item, setItem] = useState('');
  const [notes, setNotes] = useState('');

  const startBooking = () => {
    setIsBooking(true);
    setShowModal(true);
  };

  const handlePickupUpdate = (name: string, lat: number, lng: number) => {
    setPickupName(name);
    setPickupCoords([lat, lng]);
  };

  const handleDropoffUpdate = (name: string, lat: number, lng: number) => {
    setDropoffName(name);
    setDropoffCoords([lat, lng]);
  };

  const confirmBooking = async () => {
    try {
      // 1. Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        presentToast({
          message: 'Please log in to book a ride.',
          duration: 3000,
          color: 'danger'
        });
        return;
      }

      // 2. Insert into bookings table
      const { error } = await supabase
        .from('bookings')
        .insert([{
          customer_id: user.id,
          booking_type: serviceType,
          status: 'Waiting for Rider',
          pickup_address: pickupName,
          pickup_latitude: pickupCoords[0],
          pickup_longitude: pickupCoords[1],
          dropoff_address: dropoffName,
          dropoff_latitude: dropoffCoords[0],
          dropoff_longitude: dropoffCoords[1],
          item_description: serviceType === 'Padala' ? item : null,
          customer_to_rider_notes: notes || null,
        }]);

      if (error) {
        throw error;
      }

      // 3. Update UI State
      setShowModal(false);
      setWaitingForRider(true);

    } catch (error: any) {
      console.error(error);
      presentToast({
        message: 'Failed to create booking: ' + error.message,
        duration: 3000,
        color: 'danger'
      });
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen>
        <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <Map 
              isBlurred={!isBooking && !waitingForRider} 
              isBooking={isBooking && !waitingForRider} 
              activeField={activeLocationField}
              pickupCoords={pickupCoords}
              dropoffCoords={dropoffCoords}
              onPickupUpdate={handlePickupUpdate}
              onDropoffUpdate={handleDropoffUpdate}
              routePoints={waitingForRider ? { pickup: pickupCoords, dropoff: dropoffCoords } : null}
            />
          </div>
          
          {/* Overlay Card when not booking and not waiting */}
          {!isBooking && !waitingForRider && (
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

          {/* Waiting for Rider Box */}
          {waitingForRider && (
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '400px',
              zIndex: 1000,
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
                Waiting for Rider...
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                We are sending your {serviceType} request to nearby riders. Please wait.
              </p>
            </div>
          )}

          {/* Bottom Sheet Modal for Booking */}
          <IonModal
            isOpen={showModal}
            initialBreakpoint={0.5}
            breakpoints={[0, 0.5, 0.9]}
            onDidDismiss={() => {
              if (!waitingForRider) {
                setShowModal(false);
                setIsBooking(false);
              }
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
              <IonItem 
                className="ion-margin-bottom" 
                style={{ 
                  borderRadius: '10px', 
                  border: activeLocationField === 'pickup' ? '2px solid var(--ion-color-primary)' : 'none' 
                }}
              >
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonInput 
                  label="Pickup Location" 
                  labelPlacement="floating" 
                  value={pickupName} 
                  readonly 
                  onFocus={() => setActiveLocationField('pickup')}
                />
              </IonItem>

              <IonItem 
                className="ion-margin-bottom" 
                style={{ 
                  borderRadius: '10px',
                  border: activeLocationField === 'dropoff' ? '2px solid var(--ion-color-secondary)' : 'none' 
                }}
              >
                <IonIcon icon={mapOutline} slot="start" color="secondary" />
                <IonInput 
                  label="Dropoff Location" 
                  labelPlacement="floating" 
                  placeholder="Tap here, then drag blue pin" 
                  value={dropoffName}
                  readonly
                  onFocus={() => setActiveLocationField('dropoff')}
                />
              </IonItem>

              {/* Padala Item Field */}
              {serviceType === 'Padala' && (
                <IonItem className="ion-margin-bottom" style={{ borderRadius: '10px' }}>
                  <IonIcon icon={cubeOutline} slot="start" color="warning" />
                  <IonInput 
                    label="Item Description" 
                    labelPlacement="floating" 
                    placeholder="What are you sending?" 
                    value={item}
                    onIonInput={e => setItem(e.detail.value as string)}
                  />
                </IonItem>
              )}

              {/* Notes for Rider */}
              <IonItem className="ion-margin-bottom" style={{ borderRadius: '10px' }}>
                <IonIcon icon={chatbubbleOutline} slot="start" color="medium" />
                <IonTextarea 
                  label="Notes for Rider" 
                  labelPlacement="floating" 
                  placeholder="Any specific instructions?" 
                  value={notes}
                  onIonInput={e => setNotes(e.detail.value as string)}
                  autoGrow
                />
              </IonItem>

              <IonButton expand="block" shape="round" className="ion-margin-top" style={{ height: '50px' }} onClick={confirmBooking}>
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
